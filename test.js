import fs from 'fs';
console.log("Verificando archivos esenciales...");
['archivo.js','config.js','handler.js'].forEach(f=>{
  console.log(f, fs.existsSync(f) ? "✅" : "❌");
});

