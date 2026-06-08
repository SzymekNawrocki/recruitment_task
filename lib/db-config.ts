// Parses a Prisma SQL Server connection URL (JDBC-style) into the config object
// expected by the @prisma/adapter-mssql driver adapter.
//
// Example input (injected by Terraform as DATABASE_URL):
//   sqlserver://host.database.windows.net;database=mydb;user=sqladmin;password=xxx;encrypt=true;trustServerCertificate=false;loginTimeout=30
export function mssqlConfigFromUrl(raw: string | undefined) {
  if (!raw) {
    throw new Error('DATABASE_URL is not set')
  }

  const withoutScheme = raw.replace(/^sqlserver:\/\//, '')
  const [hostPart, ...pairs] = withoutScheme.split(';')

  const params: Record<string, string> = {}
  for (const pair of pairs) {
    if (!pair) continue
    const idx = pair.indexOf('=')
    if (idx === -1) continue
    const key = pair.slice(0, idx).trim().toLowerCase()
    const value = pair.slice(idx + 1).trim()
    params[key] = value
  }

  let server = hostPart.trim()
  let port = 1433
  const portMatch = server.match(/:(\d+)$/)
  if (portMatch) {
    port = parseInt(portMatch[1], 10)
    server = server.replace(/:(\d+)$/, '')
  }

  return {
    server,
    port,
    database: params['database'],
    user: params['user'],
    password: params['password'],
    options: {
      encrypt: params['encrypt'] ? params['encrypt'] === 'true' : true,
      trustServerCertificate: params['trustservercertificate'] === 'true',
    },
  }
}
