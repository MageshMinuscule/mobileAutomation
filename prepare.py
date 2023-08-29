import subprocess

def run_commands(commands):
    for command in commands:
        try:
            subprocess.run(command, shell=True, check=True)
            print(f"Command '{command}' executed successfully.")
        except subprocess.CalledProcessError as e:
            print(f"Error while executing command '{command}': {e}")

if __name__ == "__main__":
    commands = [
        "ionic cordova platform rm android",
        "ionic cordova platform add android",
        "ionic cordova prepare android"
    ]

    run_commands(commands)