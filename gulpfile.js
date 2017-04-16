var gulp = require('gulp'), //подключает пакеты из папки node_modules в наш проект
		sass = require('gulp-sass'), //Подключаем Sass пакет
		browserSync = require('browser-sync'), // Подключаем Browser Sync отслеживания состояния файлов обновление в браузере, локальный сервер
		concat = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
		uglify = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
		cssnano = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
		rename = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
		del = require('del'), // Подключаем библиотеку для удаления файлов и папок
		imagemin = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
		pngquant = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
		cache = require('gulp-cache'), // Подключаем библиотеку кеширования используеться для производительности сжатия изображений
		autoprefixer = require('gulp-autoprefixer'),// Подключаем библиотеку для автоматического добавления префиксов браузеров
		svgmin = require('gulp-svgmin'), //Сжатие изображений SVG
		csso = require('gulp-csso'), //Минификация CSS
		uncss = require('gulp-uncss'); //Чистит стиль от неиспользованных селекторов в html

//Инструкция
gulp.task('help', function() { //команда для запуска проекта "gulp mytask" вместо указания файла
		console.log('\x1b[33m%s\x1b[0m', '                Привет, я таск!\n ----------------------');
		console.log('1. (\x1b[33msass\x1b[0m) приобразует .sass в .css');
		console.log('2. (\x1b[33mcss\x1b[0m) сжатие файлов .css (удаляет веб префиксы)');
		console.log('3. (\x1b[33mcsso\x1b[0m) минификация файлов .css (не удаляет веб префиксы)');
		console.log('4. (\x1b[33mun-css\x1b[0m) удаление не используемух селекторов');
		console.log('5. (\x1b[33mscripts\x1b[0m) сжимает/конкатенация .js файлы и libs.');
		console.log('6. (\x1b[33mimg\x1b[0m) сжимает изображений с учётом кэширования.(GIF, JPEG, PNG, SVG)');
		console.log('7. (\x1b[33msvg\x1b[0m) сжимает SVG.');
		console.log('8. (\x1b[33mwatch\x1b[0m) активирует отслеживание за изменениями файлов проекта.');
		console.log('9. (\x1b[33mbrowser-sync\x1b[0m) активирует локальный сервер.');
		console.log('10. Для установки библиотек введите (\x1b[33mbower i jquery\x1b[0m) (\x1b[33mbower i magnific-popup\x1b[0m)');
		console.log('11. (\x1b[33mclear\x1b[0m) чистим папку dist');
		console.log('12. (\x1b[33mclear-g\x1b[0m) чистим кеш Gulp');
		
});

gulp.task('sass', function(){ // Создаем таск "sass"
		return gulp.src('app/sass/**/*.sass') // Берем источник
				.pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
				.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксов браузеров автаматически
				.pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
				.pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении по средствам расширения browserSync
});

//Локальный сервер
gulp.task('browser-sync', function() { // Создаем таск browser-sync
		browserSync({ // Выполняем browser Sync
				server: { // Определяем параметры сервера
						baseDir: 'app' // Директория для сервера - app
				},
				notify: false // Отключаем уведомления
		});
});

//Сборка и сжатие всех библиотек JS в одну
gulp.task('scripts', function() {
		return gulp.src([ // Берем все необходимые библиотеки
				'app/js/**/*.js', // Берем js скрипты
				'app/libs/**/*.js' // Берем js библиотеки
				])
				.pipe(concat('pand.min.js')) // Собираем их в кучу в новом файле libs.min.js
				.pipe(uglify()) // Сжимаем JS файл
				.pipe(gulp.dest('dist/js')); // Выгружаем в папку app/js
});


//Cжатие css
gulp.task('css', function() {
		return gulp.src('app/css/**/*.css') // Выбираем файл для минификации
				.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксов браузеров автаматически
				.pipe(cssnano()) // Сжимаем
				.pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
				.pipe(gulp.dest('dist/css')); // Выгружаем в папку app/css
});

//Минификация css
gulp.task('csso', function () {
		return gulp.src('app/css/**/*.css')
				.pipe(csso({
						restructure: false,
						sourceMap: true,
						debug: true
				}))
				.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксов браузеров автаматически
				.pipe(rename({suffix: '.conc'})) // Добавляем суффикс .conc
				.pipe(gulp.dest('dist/css'));
});

//Удаляет не использованные селекторы
gulp.task('un-css', function () {
		return gulp.src('app/css/site.css')//Нужно менять, в зависимости от проекта
				.pipe(uncss({
						html: ['index.html', 'app/**/*.html', 'http://example.com']
				}))
				.pipe(gulp.dest('dist/css'));
});

//Следим за изменениями
gulp.task('watch', ['browser-sync', 'sass', 'css-libs', 'scripts'], function() {
		gulp.watch('app/sass/**/*.sass', ['sass']); // Наблюдение за sass файлами
		gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
		gulp.watch('app/js/**/*.js', browserSync.reload); // Наблюдение за JS файлами в папке js
		// Наблюдение за другими типами файлов
});

//Оптимизация изображений 
gulp.task('img', function() {
		return gulp.src('app/img/**/*') // Берем все изображения из app
				.pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
						interlaced: true,
						progressive: true,
						svgoPlugins: [{removeViewBox: false}],
						use: [pngquant()]
				})))
				.pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
		});

//Оптимизация SVG
gulp.task('svg', function () {
		return gulp.src('app/img/**/*.svg')
				.pipe(cache(svgmin()))
				.pipe(gulp.dest('dist/img'));
});

//Чистим папку dist
gulp.task('clear', function() {
		return del.sync('dist'); // Удаляем папку dist перед сборкой
});

//Автаматическая очистка кеша Gulp
gulp.task('clear-g', function() {
		return cache.clearAll(); //очистка кеша
});
