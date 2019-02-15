let fs = require('fs');
let path = require('path')

let b = require2('./b.js')

function require2(mod) {
  let filename = path.join(__dirname, mod);
  let content = fs.readFileSync(filename, 'utf8');
  let fn = new Function('exports', 'require', 'module', '__filename', '__dirname', content + "\n return module.exports")

  let module = {
    exports: {}
  }

  return fn(module.exports, require2, module, __filename, __dirname)
}