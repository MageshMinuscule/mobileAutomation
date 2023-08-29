import os
from bs4 import BeautifulSoup
def find_non_translate_tags(html, file_path):
    soup = BeautifulSoup(html, 'html.parser')
    tags_to_search = ['ion-label', 'ion-header', 'div', 'span']
    non_translate_tags = []

    for tag_name in tags_to_search:
        tags = soup.find_all(tag_name)
        for tag in tags:
            if not tag.find(text='| translate'):
                word = tag.text.strip()
                non_translate_tags.append((tag, tag_name, word, file_path))

    return non_translate_tags

# Folder path
folder_path = 'D:/mobileApplication/Backup/backUp-4/mobilecode/cryotos/src/app'

# Iterate through the files in the folder
for root, dirs, files in os.walk(folder_path):
    for file in files:
        if file.endswith('.html'):
            file_path = os.path.join(root, file)

            # Read the HTML file
            with open(file_path, 'r') as file:
                html = file.read()

            non_translate_tags = find_non_translate_tags(html, file_path)

            if len(non_translate_tags) > 0:
                for tag, tag_name, word, path in non_translate_tags:
                    print(f"Tag: {tag}")
                    print(f"Tag Name: {tag_name}")
                    print(f"Word: {word}")
                    print(f"Path: {path}")
                    print()
            else:
                print(f"No non-translate tags found in {file_path}.")


