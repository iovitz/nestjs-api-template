const healthCheckUrl = 'http://localhost:8080/api/health'
const ntfyUrl = 'https://ntfy.sh/notice-01K8JB8YBCZE60JT4NTXMPT35C'

fetch(healthCheckUrl)
  .then(async (response) => {
    const { data } = await response.json()
    console.log('Health check response:', data.info)
  })
  .catch(async (error) => {
    console.error('Health check error:', error.message)
    await fetch(ntfyUrl, {
      method: 'POST',
      headers: {
        // Click: 'https://home.nest.com/',
        Email: 'phil@example.com',
        Markdown: true,
      },
      body: `# 健康检查出错`,
    })
    return false
  })
