# Testing documentation

## Test enviroment initialization

Change directory to tests/

```bash
cd tests
```

### 1. Virtual enviroment

Create .venv folder

```bash
python -m venv .venv
```

Activate the virtual enviroment

- Windows

```bash
.venv\Scripts\activate
```

- macOS

```bash
source .venv/bin/activate
```

Add .venv folder to .gitignore.

### 2. Install the requirements and test the installation

Just in case, upgrade pip to the newest version

```bash
python -m pip install --upgrade pip
```

Then install the requirements

```bash
pip install -r requirements.txt
```

After that you should test the installation from your terminal

```bash
python installTest.py
```

Its should print the following:

```bash
Python: 3.12.1 (tags/v3.12.1:2305ca5, Dec  7 2023, 22:03:25) [MSC v.1937 64 bit (AMD64)]
Robot Framework: 7.2.2
Browser: 19.4.0
requests: 2.32.3
CryptoLibrary: 0.4.2
```

Note: Version numbers may vary.
