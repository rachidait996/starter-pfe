import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item, Items } from 'app/modules/admin/apps/file-manager/file-manager.types';
import { BehaviorSubject, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FileManagerService
{
    private _item: BehaviorSubject<Item | null> = new BehaviorSubject(null);
    private _items: BehaviorSubject<Items | null> = new BehaviorSubject(null);

    private apiUrl = 'http://localhost:8080/api/items';

    constructor(private _httpClient: HttpClient)
    {
    }

    // ---------------------------------
    // Accessors
    // ---------------------------------

    get items$(): Observable<Items>
    {
        return this._items.asObservable();
    }

    get item$(): Observable<Item>
    {
        return this._item.asObservable();
    }

    // ---------------------------------
    // Get items by folder
    // ---------------------------------

   getItems(folderId: string | null = null): Observable<Item[]>
{
    const id = folderId ?? '0';

    return this._httpClient.get<Items>(`${this.apiUrl}/folders/${id}`).pipe(
        tap((response: Items) =>
        {
            // Store full response
            this._items.next(response);
        }),
        map((response: Items) =>
        {
            // Return folders + files as Item[]
            return [...response.folders, ...response.files];
        })
    );
}
    // ---------------------------------
    // Get item by id (from loaded data)
    // ---------------------------------

    getItemById(id: string): Observable<Item>
    {

            const itemId = Number(id);

        return this._items.pipe(
            take(1),
            map((items: Items) =>
            {
                console.log(items);
                const item = [...items.folders, ...items.files]
                    .find(value => value.id === itemId) || null;

                this._item.next(item);

                return item;
            }),
            switchMap((item) =>
            {
                if (!item)
                {
                    return throwError(() => new Error('Could not find item with id ' + id));
                }

                return of(item);
            })
        );
    }

    // ---------------------------------
    // Create folder
    // ---------------------------------

    createFolder(name: string, parentId?: string)
    {
        const formData = new FormData();
        formData.append('name', name);

        if (parentId)
        {
            formData.append('parentId', parentId);
        }

        return this._httpClient.post<Item>(`${this.apiUrl}/folder`, formData);
    }

    // ---------------------------------
    // Upload file
    // ---------------------------------

     uploadFile(file: File, parentId?: string)
    {
        const formData = new FormData();
        formData.append('file', file);

        if (parentId)
        {
            formData.append('parentId', parentId);
        }

        return this._httpClient.post<Item>(`${this.apiUrl}/upload`, formData);
    }
/**
 * Supprimer un item par son ID
 */
deleteItem(item: any): Observable<any> {
    // On identifie l'ID du dossier parent avant la suppression
    // Si item.parent est un objet, on prend item.parent.id, sinon on cherche item.parentId
    const parentId = item.parent?.id || item.parentId || '0';
console.log('Deleting item with ID:', item.id, 'Parent ID:', parentId);
    return this._httpClient.delete(`${this.apiUrl}/${item.id}`).pipe(
        // On recharge les données du dossier parent pour que la liste soit à jour
        switchMap(() => this.getItems(parentId.toString())),
        take(1)
    );
}
}