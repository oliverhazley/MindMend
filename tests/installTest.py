"""
installTest.py
---------------
This is an installation test that prints the versions of Python, Robot Framework, 
and other used libraries. This file is intended to be used when testing
that all required libraries have been installed.
"""

# Print Python version
import sys
print('Python:', sys.version)

# Print versions of Robot Framework and other used libraries
try:
    import robot
    print('Robot Framework:', robot.__version__)
except ImportError:
    print('robot module not found')

# Check if Browser, RequestsLibrary and CryptoLibrary modules are available
try:
    import Browser
    print('Browser:', Browser.__version__)
except ImportError:
    print('Browser module not found')

try:
    # RequestsLibrary is available in Python as requests
    import requests
    print('requests:', requests.__version__)
except ImportError:
    print('RequestsLibrary or requests module not found')

try:
    import CryptoLibrary
    print('CryptoLibrary:', CryptoLibrary.__version__)
except ImportError:
    print('CryptoLibrary module not found')