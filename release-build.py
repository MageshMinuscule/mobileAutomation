# import subprocess
# import os
# import shutil
# # import requests
# import json
# import sys
# import os.path
# # from requests.exceptions import ConnectionError
# with open('build.json', 'r') as f:
#     config = json.load(f)
# choice = sys.argv[1]
# print("You choosed : %s" % choice)
# tspath = config['paths'][choice]['tspath']
# xmlpath = config['paths'][choice]['xmlpath']
# jsonpath = config['paths'][choice]['jsonpath']
# apkpath = config['paths'][choice]['apkpath']
# fcmJsonPath = config['paths']['fcmJsonPath']
# shutil.copy2(xmlpath, "config.xml")
# shutil.copy2(tspath, "src/app/config.ts")
# shutil.copy2(jsonpath, "google-services.json")
# shutil.copy2(jsonpath, fcmJsonPath)
# print("Configuration changed successfully for %s" % choice)
# cmd = "cordova clean"
# p = subprocess.Popen(cmd, shell=True)
# out, err = p.communicate()
# cmd = "cordova clean android"
# p = subprocess.Popen(cmd, shell=True)
# out, err = p.communicate()
# cmd = "ionic cordova build android --prod --release"
# p = subprocess.Popen(cmd, shell=True)
# out, err = p.communicate()
# print("Apk Build")

# filePath = config['paths']['apkPath']+'app-release-unsigned.apk'
# shutil.copy2(filePath ,config['paths']['buildpath']+'/app-release-unsigned.apk')
# os.chdir(config['paths']['buildpath'])
# cmd = "jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.jks -storepass Minuscule-1 app-release-unsigned.apk cmms"
# p = subprocess.Popen(cmd, shell=True)
# out, err = p.communicate()
# if os.path.exists("cryotos.apk"):
#     os.remove("cryotos.apk")
# cmd = "zipalign -v 4 app-release-unsigned.apk cryotos.apk"
# p = subprocess.Popen(cmd, shell=True)
# out, err = p.communicate()
# build_file = 'cryotos.apk'
# print("Apk Build successfully",build_file)
# -----------------------------------------------------
import subprocess
import json
import sys
import os
import shutil

# Load configuration from build.json
with open('build.json', 'r') as f:
    config = json.load(f)

# Get the choice from command-line arguments
choice = sys.argv[1]
print("You chose:", choice)

# Set the paths from the configuration
tspath = config['paths'][choice]['tspath']
xmlpath = config['paths'][choice]['xmlpath']
jsonpath = config['paths'][choice]['jsonpath']
apkpath = config['paths'][choice]['apkpath']
fcmJsonPath = config['paths']['fcmJsonPath']

# Copy necessary files
shutil.copy2(xmlpath, 'config.xml')
shutil.copy2(tspath, 'src/app/config.ts')
shutil.copy2(jsonpath, 'google-services.json')
shutil.copy2(jsonpath, fcmJsonPath)
print("Configuration changed successfully for", choice)

# Clean the project
subprocess.run("ionic cordova clean", shell=True, check=True)
subprocess.run("ionic cordova clean android", shell=True, check=True)

# Build the APK
subprocess.run("ionic cordova build android --prod --release", shell=True, check=True)
print("APK Build")

# Copy the generated APK
apk_file = 'app-release-unsigned.apk'
src_apk_path = os.path.join(config['paths']['apkPath'], apk_file)
dest_apk_path = os.path.join(config['paths']['buildpath'], apk_file)
shutil.copy2(src_apk_path, dest_apk_path)

# Change directory to buildpath
os.chdir(config['paths']['buildpath'])

# Sign the APK
subprocess.run("jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.jks -storepass Minuscule-1 app-release-unsigned.apk cmms", shell=True, check=True)

# Remove the existing APK if present
if os.path.exists("cryotos.apk"):
    os.remove("cryotos.apk")

# Align the APK
subprocess.run("zipalign -v 4 app-release-unsigned.apk cryotos.apk", shell=True, check=True)
build_file = 'cryotos.apk'

print("APK Build successful:", build_file)




