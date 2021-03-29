import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ItemCrudService } from '../item-crud.service';
import { ItemInputService } from '../item-input.service';
import { ReviewItemsService } from '../review-items.service';

@Component({
  selector: 'app-review-item',
  templateUrl: './review-item.component.html',
  styleUrls: ['./review-item.component.css'],
})
export class ReviewItemComponent implements OnInit {
  public editMode: boolean = false;
  public totalInputs: number[];
  public itemId: string;
  private currItem: {
    _id: string;
    fields: string[];
    values: string[];
    longFieldIndex: number;
  };
  public currItemIndex: number;
  public reviewCount: number;

  private currentIdSub: Subscription;
  private currItemChangeSub: Subscription;

  constructor(
    private itemInputService: ItemInputService,
    private itemCrudService: ItemCrudService,
    private reviewItemsService: ReviewItemsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.totalInputs = this.itemInputService.totalInputs;
    this.reviewCount = this.reviewItemsService.itemIds.length;
    this.currItemChangeSub = this.itemInputService.itemSelectedSubject.subscribe(
      () => {
        this.currItem = this.reviewItemsService.currItem;
        this.currItemIndex = this.reviewItemsService.itemIds.findIndex(
          (el) => el === this.currItem._id
        );
        this.loadCurrItem(this.currItem);
      }
    );
    this.currentIdSub = this.route.params.subscribe((params) => {
      this.itemId = params.id;
      // case when navigating using url bar there will be no array of itemIds
      if (this.reviewItemsService.itemIds.length === 0) {
        this.reviewItemsService.itemIds.push(this.itemId);
      }
      this.onSelectItem(this.itemId);
    });
  }

  cleanUp() {
    this.editMode = false;
  }

  onPrevItem() {
    this.router.navigate(
      ['../' + this.reviewItemsService.itemIds[this.currItemIndex - 1]],
      { relativeTo: this.route }
    );
  }
  onNextItem() {
    this.router.navigate(
      ['../' + this.reviewItemsService.itemIds[this.currItemIndex + 1]],
      { relativeTo: this.route }
    );
  }

  onAddInput() {
    this.itemInputService.AddInput();
    this.cleanUp();
  }

  onEditClick() {
    this.editMode = !this.editMode;
  }

  onSaveItem() {
    // const saved: boolean = await this.itemCrudService.replaceItem(false, false);
    this.cleanUp();
  }

  onDropChanges() {
    this.loadCurrItem(this.currItem);
    this.cleanUp();
  }
  onDeleteItem() {
    // const updated: boolean = await this.itemCrudService.deleteItem();
    this.cleanUp();
  }

  loadCurrItem(currItem: {
    fields: string[];
    values: string[];
    longFieldIndex: number;
  }) {
    this.itemInputService.removeInputs(0, this.totalInputs.length);
    const fields = currItem['fields'];
    const values = currItem['values'];
    const longFieldIndex = currItem['longFieldIndex'];

    const itemLength = Math.max(fields.length, values.length);

    this.reviewItemsService.editedInputs.fieldsEdited = Array(itemLength).fill(
      false
    );
    this.reviewItemsService.editedInputs.valuesEdited = Array(itemLength).fill(
      false
    );

    this.itemInputService.loadItem(fields, values, longFieldIndex);
    this.cleanUp();
  }

  async onSelectItem(itemId: string) {
    if (
      this.itemCrudService.localItems &&
      this.itemCrudService.localItems[itemId]
    ) {
      // this will call loadCurrItem and set this.currItem
      this.reviewItemsService.setCurrItem({
        _id: itemId,
        ...this.itemCrudService.localItems[itemId],
      });
    } else {
      // this will eventually next a currItem change and run loadCurrItem
      this.reviewItemsService.getOneItem(itemId);
    }
    this.cleanUp();
  }

  ngOnDestroy(): void {
    this.itemInputService.removeInputs(0, this.totalInputs.length);
    this.currentIdSub.unsubscribe();
    this.currItemChangeSub.unsubscribe();
  }
}
