import json
import base64
import requests
import datetime
import os

# Configuration
# Replace with your actual GitHub Personal Access Token (with repo access)
# Or set the GITHUB_TOKEN environment variable
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "YOUR_GITHUB_PAT")
REPO_OWNER = "ispirovjr"
REPO_NAME = "ispirovjr.github.io"
FILE_PATH = "status.json"

def update_status(script_name, status, message):
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{FILE_PATH}"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

    # 1. Get the current file (we need its SHA to update it)
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        sha = data['sha']
        current_content = json.loads(base64.b64decode(data['content']).decode('utf-8'))
    elif response.status_code == 404:
        # File doesn't exist yet, we'll create it
        sha = None
        current_content = {"last_updated": "", "scripts": []}
    else:
        print(f"Error fetching status.json: {response.status_code} - {response.text}")
        return

    # 2. Update the local structure
    now = datetime.datetime.utcnow().isoformat() + "Z"
    current_content["last_updated"] = now
    
    script_found = False
    for s in current_content["scripts"]:
        if s["name"] == script_name:
            s["status"] = status
            s["message"] = message
            s["updated"] = now
            script_found = True
            break
            
    if not script_found:
        current_content["scripts"].append({
            "name": script_name,
            "status": status,
            "message": message,
            "updated": now
        })

    # 3. Commit the change
    new_content_json = json.dumps(current_content, indent=2)
    encoded_content = base64.b64encode(new_content_json.encode('utf-8')).decode('utf-8')
    
    commit_data = {
        "message": f"Update status for {script_name} to {status}",
        "content": encoded_content
    }
    if sha:
        commit_data["sha"] = sha
        
    put_response = requests.put(url, headers=headers, json=commit_data)
    
    if put_response.status_code in (200, 201):
        print(f"Successfully updated {script_name} status.")
    else:
        print(f"Error updating status: {put_response.status_code} - {put_response.text}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 4:
        print("Usage: python update_status.py <script_name> <status: running|idle|error> <message>")
        print("Example: python update_status.py 'Simulation' 'running' 'Epoch 15/100'")
        sys.exit(1)
        
    update_status(sys.argv[1], sys.argv[2], sys.argv[3])
