import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
  public currItem: {
    _id: string;
    fields: string[];
    values: string[];
    longFieldIndex: number;
  };
  public currItemIndex: number;
  public reviewCount: number;
  public cellEdited: boolean = false;
  public reviewOver: boolean = false;

  private currentIdSub: Subscription;
  private itemSelectedSub: Subscription;
  private itemReplacedSub: Subscription;

  constructor(
    private itemInputService: ItemInputService,
    private itemCrudService: ItemCrudService,
    private reviewItemsService: ReviewItemsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.totalInputs = this.itemInputService.totalInputs;
    this.itemSelectedSub = this.itemInputService.itemSelectedSubject.subscribe(
      () => {
        // change the review count in case of deletion
        this.reviewCount = this.reviewItemsService.itemIds.length;
        this.currItem = this.reviewItemsService.currItem;
        this.currItemIndex = this.reviewItemsService.itemIds.findIndex(
          (el) => el === this.currItem._id
        );
        this.loadCurrItem();
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
    this.itemReplacedSub = this.reviewItemsService.itemReplacedSubject.subscribe(
      () => {
        this.cellEdited = false;
      }
    );
  }

  cleanUp() {
    this.editMode = false;
  }

  onPrevItem() {
    this.cellEdited = false;
    this.router.navigate(
      ['../' + this.reviewItemsService.itemIds[this.currItemIndex - 1]],
      { relativeTo: this.route }
    );
  }
  onNextItem() {
    this.cellEdited = false;

    this.router.navigate(
      ['../' + this.reviewItemsService.itemIds[this.currItemIndex + 1]],
      { relativeTo: this.route }
    );
  }

  onAddInput() {
    this.itemInputService.AddInput({
      field: '',
      value: '',
      suspendSubject: false,
    });
    this.cleanUp();
  }

  onEditClick() {
    this.editMode = !this.editMode;
  }

  onSaveAsNew() {
    this.itemCrudService.createItem(false, false);
    this.onDropChanges();
  }

  onUpdateItem() {
    this.reviewItemsService.replaceCurrItem();
    this.cleanUp();
  }

  onDropChanges() {
    this.reviewItemsService.setCurrItem(this.currItem);
    this.cellEdited = false;
    this.cleanUp();
  }
  onDeleteItem() {
    this.itemCrudService.deleteItem({ isTemplate: false, itemId: this.itemId });
    if (this.reviewCount === 1) {
      this.reviewOver = true;
    } else if (
      this.currItemIndex ===
      this.reviewItemsService.itemIds.length - 1
    ) {
      this.onPrevItem();
    } else if (
      this.currItemIndex <
      this.reviewItemsService.itemIds.length - 1
    ) {
      this.onNextItem();
    }
    this.reviewItemsService.dropReviewId(this.currItemIndex);
    this.cleanUp();
  }

  loadCurrItem() {
    this.itemInputService.removeInputs(0, this.totalInputs.length);
    this.reviewItemsService.resetEditedCells();

    const fields = this.currItem['fields'];
    const values = this.currItem['values'];
    const longFieldIndex = this.currItem['longFieldIndex'];

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
    this.itemSelectedSub.unsubscribe();
    this.itemReplacedSub.unsubscribe();
  }
}
