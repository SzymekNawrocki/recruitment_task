# Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "${var.prefix}-rg"
  location = var.location
}

# Azure Container Registry — admin disabled, access via Managed Identity
resource "azurerm_container_registry" "acr" {
  name                = "${replace(var.prefix, "-", "")}acr"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = false
}

# Auto-generated SQL Server password — never hardcoded anywhere
resource "random_password" "sql_pw" {
  length           = 24
  special          = true
  override_special = "!@"
}

# Azure SQL Server
resource "azurerm_mssql_server" "sql" {
  name                         = "${var.prefix}-sqlsrv"
  resource_group_name          = azurerm_resource_group.rg.name
  location                     = azurerm_resource_group.rg.location
  version                      = "12.0"
  administrator_login          = var.sql_admin_login
  administrator_login_password = random_password.sql_pw.result
  minimum_tls_version          = "1.2"
}

# Allow Azure services (App Service) to reach SQL Server
resource "azurerm_mssql_firewall_rule" "allow_azure" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.sql.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

resource "azurerm_mssql_firewall_rule" "allow_local" {
  name             = "AllowLocalDev"
  server_id        = azurerm_mssql_server.sql.id
  start_ip_address = "83.175.185.197"
  end_ip_address   = "83.175.185.197"
}

# Azure SQL Database — Basic SKU (~5 DTU, 2 GB, free student credit)
resource "azurerm_mssql_database" "db" {
  name        = "${var.prefix}-db"
  server_id   = azurerm_mssql_server.sql.id
  sku_name    = "Basic"
  max_size_gb = 2
}

# App Service Plan — F1 Free tier (Linux containers)
resource "azurerm_service_plan" "plan" {
  name                = "${var.prefix}-plan"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "F1"
}

# Assemble DATABASE_URL from Terraform-managed values — zero hardcoded credentials
locals {
  database_url = "sqlserver://${azurerm_mssql_server.sql.fully_qualified_domain_name};database=${azurerm_mssql_database.db.name};user=${var.sql_admin_login};password=${random_password.sql_pw.result};encrypt=true;trustServerCertificate=false;loginTimeout=30"
}

# App Service — Linux container pulling from ACR via Managed Identity
resource "azurerm_linux_web_app" "app" {
  name                = "${var.prefix}-app"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.plan.id

  # Variant B: SystemAssigned Managed Identity — no registry password in config
  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on = false # F1 free tier does not support always_on

    # Use Managed Identity to authenticate against ACR (no credentials stored)
    container_registry_use_managed_identity = true

    application_stack {
      docker_image_name   = "${var.prefix}:${var.image_tag}"
      docker_registry_url = "https://${azurerm_container_registry.acr.login_server}"
    }
  }

  # DATABASE_URL injected as app setting — assembled by Terraform, never hardcoded
  app_settings = {
    DATABASE_URL     = local.database_url
    WEBSITES_PORT    = "3000"
    NODE_ENV         = "production"
    DOCKER_ENABLE_CI = "true" # enables the CD webhook endpoint for auto-deploy
  }

  https_only = true
}

# Grant App Service identity the AcrPull role on the registry
resource "azurerm_role_assignment" "acr_pull" {
  scope                            = azurerm_container_registry.acr.id
  role_definition_name             = "AcrPull"
  principal_id                     = azurerm_linux_web_app.app.identity[0].principal_id
  skip_service_principal_aad_check = true
}
