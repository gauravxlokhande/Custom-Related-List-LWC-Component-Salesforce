import { LightningElement, api, track } from 'lwc';
import returnAllRelatedObjNames from '@salesforce/apex/CustomLookup.returnAllRelatedObjNames';
import returnAllRelatedObjFields from '@salesforce/apex/CustomLookup.returnAllRelatedObjFields';
import queryObjectData from '@salesforce/apex/CustomLookup.queryObjectData';

export default class CustomeLookup extends LightningElement {
    @api objectApiName;
    @track StoreAllRelatedObjects = [];
    @track isShowModal = false;
    @track StoreAllObjectFields = [];
    @track objName = 'Contact';
    @track selectedOptionsList = [];
    @track columns = [];
    @track StoreAllRecordsData = [];
    @track options = [];

    connectedCallback() {
        this.returnAllRelatedObject();
        console.log('Current Object Name::', this.objectApiName);
    }

   async returnAllRelatedObject() {
       await returnAllRelatedObjNames({ ObjectName: this.objectApiName })
            .then((result) => {
                this.StoreAllRelatedObjects = result;
                console.log('Current Object Related Objects Names::', JSON.stringify(this.StoreAllRelatedObjects));
            }).catch((error) => {
                console.error(error);
            });
    }

  async  handleClickOfSelectFields(event) {
      //  this.objName = event.currentTarget.dataset.name;
        this.isShowModal = true;
        console.log('Template Object Name::', this.objName);

       await returnAllRelatedObjFields({ ObjectName: this.objName })
            .then((result) => {
                this.StoreAllObjectFields = result.map(field => ({ label: field, value: field }));
                console.log('Template Object Fields::', JSON.stringify(this.StoreAllObjectFields));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    handleClickOfCloseModal() {
        this.isShowModal = false;
    }

    handleChangeOfSelectedFields(event) {
        this.selectedOptionsList = event.detail.value;
        console.log('Selected Object Fields:', this.selectedOptionsList);
    }
    

     handleClickOfOk() {
        this.columns = this.selectedOptionsList.map(field => ({ label: field, fieldName: field }));
        this.FetchallobjectData();
    }
    
    FetchallobjectData() {
        queryObjectData({ objectName: this.objName, fields: this.selectedOptionsList })
            .then((result) => {
                this.isShowModal = false;
                this.StoreAllRecordsData = result;
                console.log('Selected Object records:', result);
            }).catch((error) => {
                console.error(error.body.message);
            });
    }
    
}
