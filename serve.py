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
# shutil.copy2(xmlpath, "config.xml")
# shutil.copy2(tspath, "src/app/config.ts")
# shutil.copy2(jsonpath, "google-services.json")
# print("Configuration changed successfully for %s" % choice)


# if !os.path.isdir("node_modules"):
#     cmd = "npm i"
#     p = subprocess.Popen(cmd, shell=True)
#     out, err = p.communicate()
#     print("node modules updated")
# try:
#     shutil.copy2('build/node_modules/angular2-signaturepad/signature-pad.js',
#                  'node_modules/angular2-signaturepad/signature-pad.js')
#     shutil.copy2('build/node_modules/signature_pad/dist/signature_pad.mjs',
#                  'node_modules/signature_pad/dist/signature_pad.mjs')
#     print("Image Annotation files updated")
#     # Directories are the same
# except shutil.Error as e:
#     print('Directory not copied. Error: %s' % e)
#     # Any error saying that the directory doesn't exist
# except OSError as e:
#     print('Directory not copied. Error: %s' % e)
# cmd = "ionic serve"
# p = subprocess.Popen(cmd, shell=True)
# out, err = p.communicate()



# import subprocess
# import os
# import shutil
# import json
# import sys

# def change_server_config(choice):
#     # Load configuration from build.json
#     with open('build.json', 'r') as f:
#         config = json.load(f)

#     # Set the paths from the configuration
#     tspath = config['paths'][choice]['tspath']
#     xmlpath = config['paths'][choice]['xmlpath']
#     jsonpath = config['paths'][choice]['jsonpath']
#     apkpath = config['paths'][choice]['apkpath']

#     # Copy necessary files
#     shutil.copy2(xmlpath, "config.xml")
#     shutil.copy2(tspath, "src/app/config.ts")
#     shutil.copy2(jsonpath, "google-services.json")
#     print("Configuration changed successfully for", choice)

# def run_ionic_commands():
#     # Remove and add the Android platform
#     subprocess.run("ionic cordova platform remove android", shell=True, check=True)
#     subprocess.run("ionic cordova platform add android", shell=True, check=True)

#     # Prepare the Android project
#     subprocess.run("ionic cordova prepare android", shell=True, check=True)

# def main():
#     choice = sys.argv[1]
#     print("You chose:", choice)
#     change_server_config(choice)
#     run_ionic_commands()
#     print("APK build preparation completed successfully!")

# if __name__ == "__main__":
#     main()


# --------------------------------------------------------------------------------


import subprocess
import os
import shutil
import json
import sys
import webbrowser  # Import the webbrowser module
import platform

def change_server_config(choice):
    # Load configuration from build.json
    with open('build.json', 'r') as f:
        config = json.load(f)

    # Set the paths from the configuration
    tspath = config['paths'][choice]['tspath']
    xmlpath = config['paths'][choice]['xmlpath']
    jsonpath = config['paths'][choice]['jsonpath']
    apkpath = config['paths'][choice]['apkpath']

    # Copy necessary files
    shutil.copy2(xmlpath, "config.xml")
    shutil.copy2(tspath, "src/app/config.ts")
    shutil.copy2(jsonpath, "google-services.json")
    print("Configuration changed successfully for", choice)

def run_ionic_commands():
    # Remove and add the Android platform
    subprocess.run("ionic cordova platform remove android", shell=True, check=True)

    # Try adding the Android platform again
    try:
        subprocess.run("ionic cordova platform add android", shell=True, check=True)
    except subprocess.CalledProcessError:
        print("An error occurred while adding the Android platform. Retrying...")
        # Remove and add the Android platform again
        subprocess.run("ionic cordova platform rm android", shell=True, check=True)
        subprocess.run("ionic cordova platform add android", shell=True, check=True)

    # Prepare the Android project
    subprocess.run("ionic cordova prepare android", shell=True, check=True)

def open_android_studio():
    # Replace 'YOUR_ANDROID_STUDIO_PATH' with the correct path to studio64.exe or studio.exe
    android_studio_path = 'C:\\Program Files\\Android\\Android Studio\\bin\\studio64.exe'

    # Replace 'YOUR_CUSTOM_PATH' with your desired path to open in Android Studio
    custom_path = 'D:\\mobileApplication\\Backup\\backUp-4\\mobilecode\\cryotos\\platforms\\android\\app'

    # Open Android Studio for the custom path based on the platform
    if platform.system() == 'Windows':
        subprocess.Popen([android_studio_path, custom_path])
    elif platform.system() == 'Darwin':  # macOS
        subprocess.Popen(['open', custom_path])
    else:  # Linux
        subprocess.Popen(['xdg-open', custom_path])

def main():
    choice = sys.argv[1]
    print("You chose:", choice)
    change_server_config(choice)
    run_ionic_commands()
    print("APK build preparation completed successfully!")
    open_android_studio()

if __name__ == "__main__":
    main()

