  /*
    Developed By: Gaurav Lokhande
    Email: gaurravlokhande@gmail.com
    Linkedin: https://www.linkedin.com/in/gauravlokhande
    Github: https://github.com/gauravxlokhande
    Trailhead: https://www.salesforce.com/trailblazer/gauravlokhande
    Instagram: gauravxlokhande
     */

    
import { LightningElement, api, track, wire } from 'lwc';
import returnAllRelatedObjFields from '@salesforce/apex/CustomLookup.returnAllRelatedObjFields';
import queryObjectData from '@salesforce/apex/CustomLookup.queryObjectData';
import { deleteRecord } from 'lightning/uiRecordApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';


const actions = [
    { label: 'Edit', name: 'edit' },
    { label: 'Delete', name: 'delete' },
    { label: 'View', name: 'view' },
];


export default class CustomeLookup extends NavigationMixin(LightningElement) {

    @api objectApiName = '';
    @api recordId = '';


    @track options = [];   // options for combobox of select object
    @track RelatedObjectData = [];  // whole data contain object relationships etc..
    @track isShowModal = false;  // modal for select perticular fields
    @track StoreRelatedField = '';   // store select object related field 'AccountId'
    @track StoreAllObjectFields = []; // store all fields that not contain Id
    @track selectedFinalFields = [];   // all user selected final fields from modal
    @track RecordLength = ''; // record lentgth
    @track SearchValue = ''; // search value from input



    // for fetching all related object and their related field
    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    wiredObjectInfo({ error, data }) {
        if (data) {
            this.options = data.childRelationships.map(relationship => ({ value: relationship.childObjectApiName, label: relationship.childObjectApiName }));
            this.RelatedObjectData = data;
            console.log('parentObjectOptions',JSON.stringify(data));
        } else if (error) {
            console.error('Error fetching object info:', error);
        }
    }

    // Selected object name from combobox
    handleselectedObjectName(event) {
        this.SelectedObject = event.detail.value;

        const selectedRelationship = this.RelatedObjectData.childRelationships.find(
            relationship => relationship.childObjectApiName === this.SelectedObject
        );
        if (selectedRelationship) {
            this.StoreRelatedField = selectedRelationship.fieldName;
            console.log('Template Object Name:', this.SelectedObject);
            console.log('Related Field Name:', this.StoreRelatedField);
        } else {
            this.StoreRelatedField = '';
            console.log('No child relationship found for:', this.SelectedObject);
        }
    }


    // select field button
    async handleClickOfSelectFields() {
        await this.FetchAllObjectFields();
        this.isShowModal = true;
    }

    // fetch all object field method from apex
    FetchAllObjectFields() {
        returnAllRelatedObjFields({ ObjectName: this.SelectedObject })
            .then((result) => {
                this.StoreAllObjectFields = result
                    .filter(field => !field.includes('Id'))
                    .map(field => ({ label: field, value: field }));
                console.log('Template Object Fields::', JSON.stringify(this.StoreAllObjectFields));
            })
            .catch((error) => {
                console.error(error);
            });
    }


    // Final selected fields from right swipe from modal
    handleChangeOfSelectedFields(event) {
        this.selectedFinalFields = event.detail.value;
        console.log(this.selectedFinalFields);
    }


    // Ok button in modal
    handleClickOfOk() {
        const actionColumn = {
            type: 'action',
            typeAttributes: { rowActions: actions },
        };
        const fieldColumns = this.selectedFinalFields.map(field => ({ label: field, fieldName: field }));
        this.columns = [...fieldColumns, actionColumn];
        this.FetchallobjectData();
        this.isShowModal = true;
    }

    // close button in modal
    handleClickOfCloseModal() {
        this.isShowModal = false;
    }


    // fetch all object related record method from apex
    FetchallobjectData() {
        console.log('Template Object Name:', this.SelectedObject);
        console.log('Related Field Name:', this.StoreRelatedField);
        console.log('Related Field Name:', this.selectedFinalFields);

        queryObjectData({ objectName: this.SelectedObject, fields: this.selectedFinalFields, RelatedField: this.StoreRelatedField, CurrentObjectId: this.recordId })
            .then((result) => {
                this.isShowModal = false;
                this.StoreAllRecordsData = result;
                this.RecordLength = this.StoreAllRecordsData.length;
                console.log('Selected Object records:', JSON.stringify(result));
            }).catch((error) => {
                console.error(error.body.message);
            });
    }


    // get search value from input
    HandleSearchRecords(event) {
        this.SearchValue = event.target.value;
        console.log('searchvalue', this.SearchValue);
        if (this.SearchValue.length > 1) {
            this.StoreAllRecordsData = this.StoreAllRecordsData.filter(item => {
                return this.selectedFinalFields.some(element => {
                    return item[element] && item[element].toLowerCase().includes(this.SearchValue.toLowerCase());
                });
            });
        } else if (this.SearchValue.length <= 1) {
            this.FetchallobjectData();
        }
    }


    // data table edit, delete, view functionality.
    handleRowAction(event) {
        const action = event.detail.action.name;
        const row = event.detail.row;

        console.log(row);
        console.log(action);
        switch (action) {
            case 'edit':
                this[NavigationMixin.Navigate]({
                    type: "standard__objectPage",
                    attributes: {
                        actionName: "edit",
                        recordId: row.Id,
                        objectApiName: this.SelectedObject
                    }
                });
                break;
            case 'delete':
                deleteRecord(row.Id)
                    .then(() => {
                        console.log('Record deleted successfully');
                        this.FetchallobjectData();
                        this.dispatchEvent(new ShowToastEvent({
                            title: "Deleted Successful",
                            message: "Record deleted successfully",
                            variant: "success"
                        }));
                    })
                    .catch(error => {
                        console.error('Error deleting record:', error);
                        this.dispatchEvent(new ShowToastEvent({
                            title: "Error deleting",
                            message: "Error deleting record",
                            variant: "success"
                        }));
                    });
                break;
            case 'view':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        actionName: 'view'
                    }
                });
                break;
            default:
                break;
        }
    }


    // new button for creating new record.
    handleClickOfNew() {
        this[NavigationMixin.Navigate]({
            type: "standard__objectPage",
            attributes: {
                actionName: "new",
                objectApiName: this.SelectedObject
            }
        });
    }



}
