output "acr_login_server" {
  description = "ACR login server URL — use for docker tag and docker push"
  value       = azurerm_container_registry.acr.login_server
}

output "app_service_url" {
  description = "Public URL of the deployed application"
  value       = "https://${azurerm_linux_web_app.app.default_hostname}"
}

output "sql_server_fqdn" {
  description = "Azure SQL Server fully qualified domain name"
  value       = azurerm_mssql_server.sql.fully_qualified_domain_name
}

output "sql_database_name" {
  description = "Azure SQL Database name"
  value       = azurerm_mssql_database.db.name
}

output "sql_admin_password" {
  description = "Generated SQL admin password (sensitive)"
  value       = random_password.sql_pw.result
  sensitive   = true
}

output "docker_push_command" {
  description = "Command to push the Docker image to ACR"
  value       = "docker push ${azurerm_container_registry.acr.login_server}/${var.prefix}:latest"
}
