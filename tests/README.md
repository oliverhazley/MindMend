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


MindMend Kirjautumistesti


MindMend/
├── backend/               # Backend-palvelin
├── frontend/              # Frontend-sovellus
└── tests/                 # Testit
    ├── login_test.robot   # Kirjautumistesti
    ├── installTest.py     
    └── requirements.txt   # Testien riippuvuudet
Vaatimukset

Python 3.7+
Node.js ja npm
Robot Framework
Robot Framework Browser -kirjasto

Asennus

Kloonaa projekti:

git clone <repository-url>
cd MindMend

Asenna backend-riippuvuudet:

cd backend
npm install

Asenna frontend-riippuvuudet:

cd ../frontend
npm install

Asenna testaukseen tarvittavat riippuvuudet:

cd ../tests
pip install -r requirements.txt

Alusta Robot Framework Browser -kirjasto:

rfbrowser init
Käynnistäminen

Käynnistä backend-palvelin:

cd backend
npm run dev

Käynnistä frontend-sovellus toisessa terminaalissa:

cd frontend
npm run dev
Testien suorittaminen
Käynnistä testit kolmannessa terminaalissa:
cd tests
robot login_test.robot
Kirjautumistestin kuvaus
Kirjautumistesti (login_test.robot) testaa seuraavat toiminnot:

Kirjautumissivulle pääsy

Tarkistaa, että kirjautumissivu latautuu
Tarkistaa, että lomake sisältää tarvittavat kentät


Kirjautumislomakkeen lähettäminen

Täyttää sähköpostikentän ja salasanakentän
Lähettää lomakkeen
Tarkistaa, että lomake on lähetetty onnistuneesti



Testin rakenne
Testi käyttää seuraavia avainsanoja:

Setup Browser: Avaa selaimen ja asettaa ikkunan koon
Go To Login Page: Siirtyy kirjautumissivulle
Page Should Contain Login Form: Tarkistaa, että lomake sisältää tarvittavat kentät
Fill Login Form: Täyttää sähköposti- ja salasanakentät
Submit Login Form: Klikkaa kirjautumispainiketta

Ongelmanratkaisu
Jos kohtaat ongelmia testien suorittamisessa, tarkista seuraavat asiat:

Varmista, että backend ja frontend ovat käynnissä
Tarkista, että kirjautumistunnukset ovat oikein
Tarkista, että kaikki URL-polut ovat oikein testissä
Tarkista, että Robot Framework Browser -kirjasto on asennettu oikein

Huomioitavaa

![pass](https://github.com/user-attachments/assets/c0ec699a-5007-4f45-9051-68aa20162ed5)

![fail](https://github.com/user-attachments/assets/a0f52140-bfa1-4c72-b82a-5bdfe87bfdea)
