const promise = require('bluebird')
const exec = require('child_process').exec
const fs = require('fs-extra')
const replace = require('replace-in-file')

/* ----------------------------------------------------------------------------------------------- */

/**
 * @function  [initReactNativeProject]
 * @returns {Void}
 */

function promiseFromChildProcess(child) {
    return new promise(function (resolve, reject) {
        child.addListener("error", reject)
        child.addListener("exit", resolve)
    })
}

function init(parameters) {
    let message = "Creating react-native project named \x1b[33m" + parameters.name

    if(parameters.package_name != "Default Package Name") {
        message += "\x1b[0m with android package name \x1b[33m" + parameters.package_name + "\x1b[37m...\n"
    } else {
        message += "\x1b[37m..."
    }

    console.log(message)

    const initProcess = exec(
        'npx react-native init ' + parameters.name + ' --version="' + parameters.version + '"'
    )

    promiseFromChildProcess(initProcess).then(function (result) {
        if (fs.existsSync('./' + parameters.name + '/index.js')) {
            createStartFile(parameters)
        }
    }, function (err) {
        
    })

    initProcess.stdout.on('data', function(data) {
        console.log("\x1b[1m", data)
    })

    initProcess.stderr.on('data', function(data) {
        console.log("\x1b[1m", data, "\x1b[1m")
    })
}

function createStartFile(parameters) {
    if(parameters.package_name != 'Default Package Name') {
        replaceAndroid(parameters)
    }
}

function replaceAndroid(parameters) {
    let androidAppFolder = parameters.name +  '/android/app/'

    const options = {
        files: [
            './' + androidAppFolder + 'src/main/java/com/' + parameters.name + '/MainActivity.java',
            './' + androidAppFolder + 'src/main/java/com/' + parameters.name + '/MainApplication.java',
            './' + androidAppFolder + 'src/main/AndroidManifest.xml',
            './' + androidAppFolder + 'build.gradle',
            './' + androidAppFolder + '_BUCK'
        ],
        from: new RegExp("com." + parameters.name.toLowerCase(), "g"),
        to: parameters.package_name
    }

    replace(options)
    .then(changedFiles => {
        fs.rename(
            './' + androidAppFolder + 'src/main/java/com/' + parameters.name + '/MainActivity.java',
            './' + androidAppFolder + 'src/main/java/MainActivity.java',
            (err) => {
                if (err) throw err

                fs.rename(
                    './' + androidAppFolder + 'src/main/java/com/' + parameters.name + '/MainApplication.java',
                    './' + androidAppFolder + 'src/main/java/MainApplication.java',
                    (err) => {
                        if (err) throw err

                        let path = parameters.package_name.replace(/\./g, '/'),
                            mkdirCommand = ""

                        for(let i = 0; i < path.split('/').length; i++) {
                            mkdirCommand += " && mkdir " + path.split('/')[i] + " && cd " + path.split('/')[i]
                        }
                        
                        let adjustPackageName = exec(
                            'cd ' + androidAppFolder + 'src/main/java/' +
                            ' && rm -r com' +
                            mkdirCommand
                        )

                        promiseFromChildProcess(adjustPackageName).then(function (result) {
                            fs.rename(
                                './' + androidAppFolder + 'src/main/java/MainActivity.java',
                                './' + androidAppFolder + 'src/main/java/' + path + '/MainActivity.java',
                                (err) => {
                                    if (err) throw err

                                    fs.rename(
                                        './' + androidAppFolder + 'src/main/java/MainApplication.java',
                                        './' + androidAppFolder + 'src/main/java/' + path + '/MainApplication.java',
                                        (err) => {
                                            if (err) throw err

                                        }
                                    );
                                }
                            );
                        }, function (err) {
                            
                        })
                    }
                )
            }
        )
    })
    .catch(error => {
        console.error('Error occurred:', error)
    })
}

module.exports = {
    init
}