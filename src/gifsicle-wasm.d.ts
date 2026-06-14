declare module "gifsicle-wasm" {
  interface GifsicleModule {
    _malloc(size: number): number;
    _free(ptr: number): void;
    _run_gifsicle(argc: number, argv: number): void;
    stringToNewUTF8(str: string): number;
    setValue(ptr: number, value: number, type: string): void;
    FS: {
      writeFile(path: string, data: Uint8Array): void;
      readFile(path: string): Uint8Array;
    };
  }

  interface GifsicleOptions {
    wasmBinary?: ArrayBuffer;
  }

  export default function createGifsicle(options?: GifsicleOptions): Promise<GifsicleModule>;
}
