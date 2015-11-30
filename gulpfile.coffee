######################
# Requires
######################
gulp                   = require 'gulp'
bower                  = require 'main-bower-files'
filter                 = require 'gulp-filter'
uglify                 = require 'gulp-uglify'
notify                 = require 'gulp-notify'
rsync                  = require 'gulp-rsync'

secrets                = require './data/secrets.json'

####################
# Paths
####################

paths =
  base:
    root : ''
    src  : './src/'
    dist : './public/'

paths.dist =
  css    : paths.base.dist + '/css'
  js     : paths.base.dist + '/js'
  images : paths.base.dist + '/images'

####################
# Error Handling (ref. https://gist.github.com/noahmiller/61699ad1b0a7cc65ae2d)
####################

watching = false

# Command line option:
#  --fatal=[warning|error|off]
ERROR_LEVELS = ['error', 'warning']

# Return true if the given level is equal to or more severe than
# the configured fatality error level.
# If the fatalLevel is 'off', then this will always return false.
# Defaults the fatalLevel to 'error'.
isFatal = (level) ->
  ERROR_LEVELS.indexOf(level) <= ERROR_LEVELS.indexOf(fatalLevel || 'error')

# Handle an error based on its severity level.
# Log all levels, and exit the process for fatal levels.
# ref. http://stackoverflow.com/questions/21602332/catching-gulp-mocha-errors#answers
handleError = (level, error) ->
  gutil.log(error.message)
  # if isFatal(level)
  #   process.exit(1)
  if watching
    this.emit('end')
  else
    process.exit(1)

# Convenience handler for error-level errors.
onError = (error) -> handleError.call(this, 'error', error)
# Convenience handler for warning-level errors.
onWarning = (error) -> handleError.call(this, 'warning', error)

####################
# Tasks
####################

gulp.task 'bower', ->
  gulp.src bower()
    .pipe filter('*.js')
    .pipe uglify()
    .pipe gulp.dest(paths.dist.js)
    .on('error', onError)

gulp.task 'default', ['bower']

gulp.task 'deploy', ->
  gulp.src(['./**/*', '!bower_components/**/*', '!node_modules/**/*'])
    .pipe rsync
      destination: '../home/deploy/'
      hostname: secrets[0].serverInfo.hostname
      username: secrets[0].serverInfo.username
      progress: true
      recursive: true
      time: true
      update: true
      compress: true
