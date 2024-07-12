# Developer Setup

## Requirements

- Node.js version >= 18
- Angular version >= 16
- add paths to your apt sources list (adapt the path if needed)

    ```bash
    sudo nano /etc/apt/sources.list.d/redpesk-sdk.list
    ```

    ```bash
    deb https://silo.redpesk.iot/redpesk/private/sdk/releases/batz-2.0-update/sdk/xUbuntu_24.04 ./
    deb https://silo.redpesk.iot/redpesk/private/sdk/releases/batz-2.0-update/sdk-third-party/xUbuntu_24.04 ./
    ```

    ```bash
    sudo apt update
    ```

- Install Full sdk environment installation
  
  http://redpesk-doc-internal.lorient.iot/docs/en/master/getting_started/rp_cli_quickstart/quickstart/quick-installation.html

  ```bash
    wget -O - https://raw.githubusercontent.com/redpesk-devtools/redpesk-sdk-tools/master/install-redpesk-sdk.sh | bash
    ```

- Install the Helloworld binding

  ```bash
  sudo apt install helloworld-binding-bin
  ```

- Install afb-ui-devtools 
  
  clone the Git repo
  
  ```bash
  git clone http://git.ovh.iot/redpesk/redpesk-devtools/afb-ui-devtools.git
  ```

  Install node dependencies

  ```bash
  npm install
  ```
  Build the application for production with last git tag version

  ```bash
  npm run build:prod
  ```

  Build the application for production with tar and last git tag version

  ```bash
  npm run build:tar
  ```

## Run the application

```bash
afb-binder --binding=/usr/redpesk/helloworld-binding/lib/afb-helloworld-skeleton.so: -vvv --roothttp $HOME/PATH_TO/afb-ui-devtools/dist -M
```
Then open http://localhost:1234 in your browser