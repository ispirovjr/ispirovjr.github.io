# Ivan Spirov — Personal Portfolio & CV

This repository contains the source code for my interactive portfolio and CV, available at [ispirovjr.github.io](https://ispirovjr.github.io).

The site serves as a digital CV detailing my educational background, research experience, and projects in computational astrophysics, and features visual assets from the MMF/NEXUS project.

## Script Status Tracker

The site includes a floating status panel to monitor the real-time progress of computational scripts running on my local or remote machines.

# Run the update
```
python update_status.py "NeoNEXUS Pipeline" "running" "Processing Epoch 15/100"
```

The script uses the GitHub REST API to commit an update to `status.json`. 


# Reset

```
git reset --soft GITID
```
