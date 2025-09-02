# xirka:bit target for PXT

pxt-xirkabit is a [Microsoft Programming Experience Toolkit (PXT)](https://github.com/Microsoft/pxt) target that allows you to program a [Xirka xirka:bit](https://xirka.id/). 

* [Try it live](https://makecode.xirka.id/)

## Issue tracking

Please add an issue if you discover an (unreported) bug.

## Developing new extensions

Authoring and testing of new extensions can be done directly from the web editor. See [our documentation](https://makecode.com/blog/github-packages) on how to get started. If you want to run the editor locally, keep reading.

### Developer Setup

This is the typical setup to work on the xirka:bit.

1. Install [Node.js](https://nodejs.org/) v18.20.8.
2. Install [Docker](https://www.docker.com/get-started) Engine version 28.1.1,
    included in Docker Desktop version 4.41.0. **Ensure that automatic update is
    disabled**.

    - Add environment variables to Docker Engine.

    - On Linux using systemd service `docker.service`:

      - `sudo systemctl edit docker`
        
        ``` ini
        [Service]
        Environment="DOCKER_ENABLE_DEPRECATED_PULL_SCHEMA_1_IMAGE=1" "CONTAINERD_ENABLE_DEPRECATED_PULL_SCHEMA_1_IMAGE=1"
        ```
    
    - On Windows using Docker Desktop on WSL2, add these in "System variables":

      | Variable | Value |
      |---|---|
      | DOCKER_ENABLE_DEPRECATED_PULL_SCHEMA_1_IMAGE | 1 |
      | CONTAINERD_ENABLE_DEPRECATED_PULL_SCHEMA_1_IMAGE | 1 |
      | WSLENV | DOCKER_ENABLE_DEPRECATED_PULL_SCHEMA_1_IMAGE:CONTAINERD_ENABLE_DEPRECATED_PULL_SCHEMA_1_IMAGE |
    
    - Restart system after adding these variables.

3. Clone this repository.
    ``` sh
    git clone -b xirkabit https://github.com/xirka-dev/pxt-xirkabit.git
    cd pxt-xirkabit
    ```

4. Install the PXT command line (add `sudo` for Mac/Linux shells).
    ``` sh
    npm install -g pxt
    ```
5. Install the pxt-xirkabit dependencies.
    ```
    npm install
    ```

### Building with CODAL locally

The following commands force a local build using CODAL. **This must be done
at least once before [running](#running)** to avoid requesting compilation on
Microsoft server.

```
pxt buildtarget --local
```

If you are also modifiying CODAL, consider running ``pxt clean`` to ensure the proper branch is picked up.

### Running

Run this command from inside `pxt-xirkabit` to open a local web server
```
pxt serve
```
If the local server opens in the wrong browser, make sure to copy the URL containing the local token. 
Otherwise, the editor will not be able to load the projects.

If you need to modify the `.cpp` files (and have installed yotta), enable yotta compilation using the `--localbuild` flag:
```
pxt serve --local
```

If you want to speed up the build, you can use the ``rebundle`` option, which skips building and simply refreshes the target information
```
pxt serve --rebundle
```

### Cleaning

Sometimes, your built folder might be in a bad state, clean it and try again.
```
pxt clean
```


### Modifying DAL/CODAL locally

* follow instructions above until `pxt serve`
* open editor on localhost and create a project
* do `export PXT_FORCE_LOCAL=1 PXT_RUNTIME_DEV=1 PXT_ASMDEBUG=1`; you can add `PXT_NODOCKER=1`; `pxt help` has help on these
* find project folder under `pxt-microbit/projects`, typically `pxt-microbit/projects/Untitled-42`
* if you're going to modify `.cpp` files in PXT, replace `"core": "*"` in `pxt.json` with `"core": "file:../../libs/core"`;
  similarly `"radio": "file:../../libs/radio"` and `"microphone": "file:../../libs/microphone"`
* you can edit `main.ts` to change the PXT side of the program; you can also edit it from the localhost editor;
  note that `Download` in the localhost editor will produce different binary than command line, as it builds in the cloud
  and uses tagged version of CODAL
* in that folder run `pxt build` - this will clone codal somewhere under `built/` (depends on build engine and docker)
* there can be an issue with exporting the variables i.e. PXT_FORCE, so including them in the build command can help solve issues `sudo PXT_NODOCKER=1 PXT_ASMDEBUG=1 PXT_RUNTIME_DEV=1 PXT_DEBUG=1 PXT_FORCE_LOCAL=1 PXT_COMPILE_SWITCHES=csv---mbcodal pxt build`
* if the target is not building, delete files in `hexcache` found in `pxt-microbit/built/hexcache` to force local build
* the built hex can be found in `pxt-microbit/projects/<your project name>/built` named `binary.hex`
* similarly, you can run `pxt deploy` (or just `pxt` which is the same) - it will build and copy to `MICROBIT` drive
* assuming the build folder is under `built/codal`, go to `built/codal/libraries` and run `code *`
* in git tab, checkout appropriate branches (they are all in detached head state to the way we tag releases)
* modify files, run `pxt`, see effects
* you can also run `pxt gdb` to debug; this requires `openocd`
* other commands using `openocd` are `pxt dmesg` which dumps `DMESG(...)` buffer and `pxt heap` which can be used to visualize PXT heap 
  (and CODAL's one to some extent)

### Updating dal.d.ts

```
cd libs/blocksprj
rm -rf built
PXT_FORCE_LOCAL=1 pxt build --local
PXT_FORCE_LOCAL=1 pxt builddaldts
mv dal.d.ts ../core---samd
```

### Updates

Make sure to pull changes from all repos regularly. More instructions are at https://github.com/Microsoft/pxt#running-a-target-from-localhost

## Update playlists in markdown

To add a new playlist, add an entry in ``/playlists.json``, and regenerate the markdown (see paragraph below). You'll now have a new markdown gallery file listing the videos which you can reference in ``/targetconfig.json``.

Get a Google API key and store it in the ``GOOGLE_API_KEY`` environment variables (turn on data from the app).

```
pxt downloadplaylists
```

## Repos 

The pxt-microbit target depends on several other repos. The main ones are:
- https://github.com/Microsoft/pxt, the PXT framework
- https://github.com/Microsoft/pxt-common-packages, common APIs accross various MakeCode editors
- https://github.com/lancaster-university/microbit, basic wrapper around the DAL
- https://github.com/lancaster-university/microbit-dal

## History

See the [MakeCode blog](https://makecode.com/blog).

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

MICROSOFT, the Microsoft Logo, and MAKECODE are registered trademarks of Microsoft Corporation. They can only be used for the purposes described in and in accordance with Microsoft’s Trademark and Brand guidelines published at https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general.aspx. If the use is not covered in Microsoft’s published guidelines or you are not sure, please consult your legal counsel or MakeCode team (makecode@microsoft.com).
