import fs from 'fs';
import path from 'path';

// Простая функция "минификации" JS - просто копирует файл
function minifyJS(code) {
    // Просто возвращаем исходный код без изменений
    return code;
}

// Простая функция "минификации" CSS - просто копирует файл
function minifyCSS(code) {
    // Просто возвращаем исходный код без изменений
    return code;
}

// Чтение исходных файлов
const jsSource = fs.readFileSync('diogen-chat-widget.js', 'utf8');
const cssSource = fs.readFileSync('diogen-chat-widget.css', 'utf8');

// "Минификация" (копирование)
const jsMinified = minifyJS(jsSource);
const cssMinified = minifyCSS(cssSource);

// Сохранение минифицированных файлов
fs.writeFileSync('diogen-chat-widget.min.js', jsMinified);
fs.writeFileSync('diogen-chat-widget.min.css', cssMinified);

// Вывод статистики
console.log('JavaScript:');
console.log(`  Исходный размер: ${(jsSource.length / 1024).toFixed(2)} KB`);
console.log(`  Размер после обработки: ${(jsMinified.length / 1024).toFixed(2)} KB`);
console.log(`  Сжатие: 0.0%`);

console.log('\nCSS:');
console.log(`  Исходный размер: ${(cssSource.length / 1024).toFixed(2)} KB`);
console.log(`  Размер после обработки: ${(cssMinified.length / 1024).toFixed(2)} KB`);
console.log(`  Сжатие: 0.0%`);

console.log('\n✅ Файлы готовы к развертыванию'); 