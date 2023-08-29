import subprocess
import os
import shutil
# import requests
import json
import sys
import os.path
# from requests.exceptions import ConnectionError
with open('build.json', 'r') as f:
    config = json.load(f)
choice = sys.argv[1]
print("You choosed : %s" % choice)
tspath = config['paths'][choice]['tspath']
xmlpath = config['paths'][choice]['xmlpath']
jsonpath = config['paths'][choice]['jsonpath']
apkpath = config['paths'][choice]['apkpath']
shutil.copy2(xmlpath, "config.xml")
shutil.copy2(tspath, "src/app/config.ts")
shutil.copy2(jsonpath, "google-services.json")
print("Configuration changed successfully for %s" % choice)
if os.path.isdir("node_modules"):
    print("Deleting node modules")
    shutil.rmtree('node_modules', ignore_errors=True)
cmd = "npm i"
p = subprocess.Popen(cmd, shell=True)
out, err = p.communicate()
print("node modules updated")
try:
    shutil.copy2('build/node_modules/angular2-signaturepad/signature-pad.js',
                 'node_modules/angular2-signaturepad/signature-pad.js')
    shutil.copy2('build/node_modules/signature_pad/dist/signature_pad.mjs',
                 'node_modules/signature_pad/dist/signature_pad.mjs')
    print("Image Annotation files updated")
    # Directories are the same
except shutil.Error as e:
    print('Directory not copied. Error: %s' % e)
    # Any error saying that the directory doesn't exist
except OSError as e:
    print('Directory not copied. Error: %s' % e)

if os.path.isdir("platforms"):
    print("Platforms already Added")
    shutil.rmtree('platforms', ignore_errors=True)

if os.path.isdir("plugins"):
    isUpdated = True
else:
    isUpdated = False
cmd = "ionic cordova platform add android"
p = subprocess.Popen(cmd, shell=True)
out, err = p.communicate()
try:
    if not isUpdated:
        if os.path.isdir('plugins/cordova-plugin-firebase-analytics'):
            shutil.rmtree('plugins/cordova-plugin-firebase-analytics')
        if os.path.isdir('plugins/cordova-support-google-services'):
            shutil.rmtree('plugins/cordova-support-google-services')
        shutil.copytree('build/plugins/cordova-plugin-firebase-analytics', 'plugins/cordova-plugin-firebase-analytics')
        shutil.copytree('build/plugins/cordova-support-google-services', 'plugins/cordova-support-google-services')
        cmd = "ionic cordova platform rm android"
        p = subprocess.Popen(cmd, shell=True)
        out, err = p.communicate()
        cmd = "ionic cordova platform add android@6.4.0"
        p = subprocess.Popen(cmd, shell=True)
        out, err = p.communicate()
    shutil.copy2('build/plugins/build.gradle', 'platforms/android/build.gradle')
    print("Plugins updated")
    # Directories are the same
except shutil.Error as e:
    print('Directory not copied. Error: %s' % e)
    # Any error saying that the directory doesn't exist
except OSError as e:
    print('Directory not copied. Error: %s' % e)

cmd = "cordova clean"
p = subprocess.Popen(cmd, shell=True)
out, err = p.communicate()
cmd = "ionic cordova build android --prod --release"
p = subprocess.Popen(cmd, shell=True)
out, err = p.communicate()
print("Apk Build")

filePath = config['paths']['apkPath']+'android-release-unsigned.apk'
shutil.copy2(filePath ,config['paths']['buildpath']+'/android-release-unsigned.apk')
os.chdir(config['paths']['buildpath'])
cmd = "jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.jks -storepass Minuscule-1 android-release-unsigned.apk cmms"
p = subprocess.Popen(cmd, shell=True)
out, err = p.communicate()
if os.path.exists("cryotos.apk"):
    os.remove("cryotos.apk")
cmd = "zipalign -v 4 android-release-unsigned.apk cryotos.apk"
p = subprocess.Popen(cmd, shell=True)
out, err = p.communicate()
build_file = 'cryotos.apk'
# if os.path.exists("cryotos.apk"):
#     print("You choosed : %s APK" % choice)
#     shutil.copy2('cryotos.apk',apkpath)
#     build_file = apkpath
print("Apk Build successfully",build_file)
# api_token = config['hockeyapp']['token']
# UPLOAD_URL = config['hockeyapp']['upload_url']
# params = {}
# params['notes'] = config['hockeyapp']['params']['notes']
# if os.path.exists(build_file):
#     print("File Exists",build_file)
#     files = {'ipa': open(build_file, 'rb')}
#     headers = {'X-HockeyAppToken' : api_token}
#     try:
#         req = requests.post(url=UPLOAD_URL, data=params, files=files, headers=headers)
#         if req.status_code == 201 or req.status_code == 200:
#             print("APK successfully uploaded to Hockeyapp...")
#             print (req.json())
#     except ConnectionError:
#         print('Connection error. Please try again.')
# else:
#     print("Apk not available for upload")