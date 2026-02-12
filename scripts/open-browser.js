var cp = require('child_process');
var url = 'http://localhost:3000';
var cmd, args;
if (process.platform === 'win32') {
  cmd = 'cmd';
  args = ['/c', 'start', '', url];
} else {
  cmd = process.platform === 'darwin' ? 'open' : 'xdg-open';
  args = [url];
}
cp.spawn(cmd, args, { stdio: 'ignore', detached: true }).unref();
