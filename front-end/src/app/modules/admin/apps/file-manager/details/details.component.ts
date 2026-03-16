import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/file-manager.service';
import { Item } from 'app/modules/admin/apps/file-manager/file-manager.types';
import { FileManagerListComponent } from 'app/modules/admin/apps/file-manager/list/list.component';
import { Subject, takeUntil } from 'rxjs';
import { LeadEditComponent } from '../../lead-editor/lead-edit/lead-edit.component';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation/public-api';
import { Router } from '@angular/router';

@Component({
    selector       : 'file-manager-details',
    templateUrl    : './details.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [MatButtonModule, RouterLink, MatIconModule, NgIf],
})
export class FileManagerDetailsComponent implements OnInit, OnDestroy
{
    item: Item;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fileManagerListComponent: FileManagerListComponent,
        private _fileManagerService: FileManagerService,
        private dialog: MatDialog,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Open the drawer
        this._fileManagerListComponent.matDrawer.open();

        // Get the item
        this._fileManagerService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: Item) =>
            {
                // Open the drawer in case it is closed
                this._fileManagerListComponent.matDrawer.open();

                // Get the item
                this.item = item;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult>
    {
        return this._fileManagerListComponent.matDrawer.close();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    openLeadEditor( id : number): void
{
    const dialogRef = this.dialog.open(LeadEditComponent, {
        width: '100%',
  maxWidth: '100%',
  height: '100%',
  panelClass: 'full-screen-dialog',
  data: { leadId: id }
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result) {
            console.log('Lead updated');
        }
    });
}
deleteItem(item: any): void {
    // On récupère le parentId que nous venons d'ajouter au Backend
    const parentId = item.parentId || 0;
    
    const targetUrl = parentId > 0 
                      ? `/file-manager/folders/${parentId}` 
                      : '/file-manager';

    const confirmation = this._fuseConfirmationService.open({
        title  : 'Delete item',
        message: `Are you sure you want to delete "${item.name}"?`,
        actions: { confirm: { label: 'Delete', color: 'warn' } }
    });

    confirmation.afterClosed().subscribe((result) => {
        if (result === 'confirmed') {
            this._fileManagerService.deleteItem(item).subscribe(() => {
                this.closeDrawer();
                // Cette fois-ci, targetUrl ne sera pas /file-manager par défaut !
                this._router.navigateByUrl(targetUrl);
            });
        }
    });
}
}

