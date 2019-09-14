#!/usr/bin/env node

const   available = require('available-versions'),
        commander = require('commander'),
        { prompt } = require('inquirer')

const   { init } = require('./logic')

let     availableReactNativeVersions = []

/* ----------------------------------------------------------------------------------------------- */

commander
    .version('0.2.1')
    .description('run-rn-init')

commander
    .description('Init React Native Project')
    .action(() => {
        if(process.argv.length === 3) {
            let name = process.argv[2]

            const fs = require('fs-extra')
            
            if (fs.existsSync('./' + name)) {
                console.log("\x1b[31m", '\nDirectory already exists!\n', "\x1b[0m")
            } else if(/\s/g.test(name)) {
                console.log("\x1b[31m", '\nCannot using whitespace in project name!\n', "\x1b[0m")
            } else {
                getReactNativeVersions(name)
            }
        } else {
            console.log("\x1b[31m", '\nProject name cannot be empty and not containing spaces!\n', "\x1b[0m")
        }
    })

commander.parse(process.argv)

const initQuestions = [
    {
        type : 'list',
        name : 'version',
        message : 'Enter react native version to use :',
        choices : availableReactNativeVersions,
        pageSize : 10
    },
    {
        type : 'input',
        name : 'package_name',
        message : 'Enter package name (Android only) :',
        default : 'Default Package Name',
        validate : function validatePackageName(package_name) {
            if(package_name == 'Default Package Name') {
                return true
            } else if(package_name.trim() === '') {
                console.log("\x1b[31m", '\nPackage name cannot be empty!\n', "\x1b[0m")

                return false
            } else if(/\s/g.test(package_name)) {
                console.log("\x1b[31m", '\nCannot using whitespace in package name!\n', "\x1b[0m")

                return false
            } else {
                return true
            }
        }
    }
];

function getReactNativeVersions(name) {
    let query = {
        name: 'react-native'
    }
    
    available(query).then(function (result) {
        for(let i = result.versions.length - 1; i >= 0; i--) {
            if(Number(result.versions[i].split(".")[1]) >= 60) {
                availableReactNativeVersions.push(result.versions[i])
            }
        }

        if(availableReactNativeVersions.length > 0) {
            console.log('')

            prompt(initQuestions).then(inputs => {
                console.log('')
    
                init({
                    ...inputs,
                    name: name
                })
            })
        }
    })
}