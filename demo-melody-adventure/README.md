# Melody Adventure

This is the prototype app for the melody choose your own adventure. Code is hacky and not production ready, but hopefully it gives an idea of how to build something similar.

## Getting Started

Prerequisites:

- Node.js
- Python 3.8+

First, install the dependencies:

```bash
pip install -r requirements.txt
npm install
```

Copy files from submodules (to train turkish makam melody generation model)

```bash
# if you haven't already initialize the submodules
mkdir -p api/makamtxt/
cp ../submodules/SymbTr/txt/hicaz*.txt api/makamtxt/
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The Flask server will be running on [http://127.0.0.1:5328](http://127.0.0.1:5328) 

At this point most buttons should work aside from the "Generate Accompaniment" button. If you are interested in using this, make sure your machince can run tensorflow 1.15 and do the following:

```bash
# Get the piano_transformer repo
git clone https://github.com/Elvenson/piano_transformer.git

# Follow its instructions to install the dependencies and checkpoints

# Update api/index.py to point to the correct path for the checkpoints, use your conda environment/path to proper script.
```
