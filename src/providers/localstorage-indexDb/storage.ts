import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
@Injectable({
  providedIn: 'root'
})
export class StorageImplementation {

    constructor(private storage: Storage) {
        this.initStorage();
      }
    
      private async initStorage() {
        await this.storage.create();
      }
    
      async add(key: string, value: any): Promise<void> {
        await this.storage.set(key, value);
      }
    
      async get<T>(key: string): Promise<T | null> {
        return this.storage.get(key);
      }
    
      async remove(key: string): Promise<void> {
        await this.storage.remove(key);
      }
}