variable "prefix" {
  type        = string
  default     = "portalzamowien"
  description = "Prefix for all Azure resource names"
}

variable "location" {
  type        = string
  default     = "swedencentral"
  description = "Azure region for all resources"
}

variable "sql_admin_login" {
  type        = string
  default     = "sqladmin"
  description = "SQL Server administrator login name"
}

variable "image_tag" {
  type        = string
  default     = "latest"
  description = "Docker image tag to deploy from ACR"
}
