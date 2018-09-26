<template>
<div class="ui padded container segment">
  
  <div class="ui segment">
    <h2 class="ui header">
      <i class="settings icon"></i>
      <div class="content">
        XLIFF Editor
        <div class="sub header">Manage your translations</div>
      </div>
    </h2>
  </div>

  <div class="ui grid left">
    <div class="three wide column">
      <div class="ui fluid vertical menu" id="sticky">

        <a class="item" 
          :key="file.uuid"
          v-for="file in files"
          @click="setActiveFile(file)"
          v-bind:class="{'active': isActiveFile(file), 'teal': isActiveFile(file)}">
          {{file.name}}
          <div class="ui label" 
            v-bind:class="{'teal': isActiveFile(file), 'left': isActiveFile(file), 'pointing': isActiveFile(file)}">
            {{getFileTranslationsUnits(file).length}}
          </div>
        </a>

        <div class="item">
          <div class="ui fluid icon input transparent">
            <input type="text" placeholder="Search..." v-model="searchStr">
            <i class="search icon"></i>
          </div>
        </div>

        <div class="item">
          <div class="ui fluid buttons">
            <button class="ui primary button" @click="generateXliff()">Generate XLIFF</button>
          </div>
        </div>

        <div class="item">
          <div class="ui fluid buttons">
            <button class="ui positive button" @click="onAdd()">Add unit</button>
          </div>
        </div>

        <div class="item" v-if="activeTranslationUnit !== null">
          <div class="ui fluid buttons">
            <button class="ui teal button" @click="editSave()">Save</button>
            <button class="ui button" @click="editCancel()">Cancel</button>
          </div>
        </div>
        <div class="item" v-if="activeTranslationUnit !== null">
          <div class="ui fluid buttons">
            <button class="ui negative button" @click="editDelete()">Delete</button>
          </div>
        </div>
      </div>
    </div>
  <div class="thirteen wide column" id="stickyContext">
    <div class="ui error message" v-if="showErrorMessage">
        <i class="close icon" @click="showErrorMessage = false"></i>
        <div class="header">
          Translation unit is incorrect:
        </div>
        <ul class="list">
          <li>These fields should be filled: <strong>source</strong> and <strong>target</strong></li>
          <li>Translation unit with the same id already exists</li>
        </ul>
      </div>

    <div class="ui container segment" v-if="isAdding">
        <div class="ui form">
          <div class="field">
            <label>ID</label>
            <input type="text" name="id" placeholder="Enter id" v-model="editUnit.id">
          </div>
          <div class="field">
            <label>Source</label>
            <input type="text" name="source" placeholder="Enter source" v-model="editUnit.source">
          </div>
          <div class="field">
            <label>Target</label>
            <input type="text" name="target" placeholder="Enter target" v-model="editUnit.target">
          </div>
          <div class="field">
            <label>Note</label>
            <input type="text" name="note" placeholder="Enter note" v-model="editUnit.note">
          </div>
          <button class="ui positive button" @click="addSave()">Save</button>
          <button class="ui button" @click="addCancel()">Cancel</button>
      </div>
    </div>

     <table class="ui fixed single line selectable compact table">
        <thead>
          <tr>
            <th colspan="4">
              <div class="ui right floated pagination menu">
                <a class="icon item">
                  <i class="left chevron icon"></i>
                </a>
                <a class="item" 
                  v-for="page of pages" 
                  :key="page" @click="setActivePage(page)" 
                  v-bind:class="{'active': page === currentPage}">
                  {{page + 1}}
                </a>
                <a class="icon item">
                  <i class="right chevron icon"></i>
                </a>
              </div>
            </th>
          </tr>
          <tr>
            <th>ID</th>
            <th>Source</th>
            <th>Target</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr class="top aligned pointer" 
            v-for="translationUnit in translationUnits" :key="translationUnit.id" 
            @click="setActiveTranslationUnit(translationUnit)">
            <template v-if="!isActiveTranslationUnit(translationUnit)">
              <td>
                <div class="ui ribbon label teal" v-if="isUnitNew(translationUnit)">New</div>
                <div class="ui ribbon label orange" v-if="isUnitEdited(translationUnit)">Edited</div>
                {{translationUnit.$.id}}
              </td>
              <td>{{translationUnit.source[0]}}</td>
              <td>{{translationUnit.target[0]}}</td>
              <td>{{translationUnit.note[0]._}}</td>
            </template>
            <template v-if="isActiveTranslationUnit(translationUnit)">
              <td>
                <div class="ui form">
                  <div class="ield">
                    <textarea type="text" rows="3" v-model="editUnit.id"></textarea>
                  </div>
                </div>
              </td>
              <td>
                <div class="ui form">
                  <div class="field">
                    <textarea type="text" rows="3" v-model="editUnit.source"></textarea>
                  </div>
                </div>
              </td>
              <td>
                <div class="ui form">
                  <div class="field">
                    <textarea type="text" rows="3" v-model="editUnit.target"></textarea>
                  </div>
                </div>
              </td>
              <td>
                <div class="ui form">
                  <div class="field">
                    <textarea type="text" rows="3" v-model="editUnit.note"></textarea>
                  </div>
                </div>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import File from '../models/File';
import * as Api from '../constants/api';
import { 
  SET_ACTIVE_FILE,
  SET_ACTIVE_TRANSLATION_UNIT,
  CLEAR_ACTIVE_TRANSLATION_UNIT,
  UPDATE_ACTIVE_TRANSLATION_UNIT,
  DELETE_ACTIVE_TRANSLATION_UNIT,
  ADD_TRANSLATION_UNIT } from '../constants/actions';
import * as Routes from '../constants/routes';
import { getRawTranslationUnits } from '@/helpers/getRawTranslationUnits';

const ERROR_MESSAGE_DELAY = 5000;

@Component({})
export default class Editor extends Vue {

  editUnit: any;
  isAdding: boolean = false;
  maxUnitsPerPage = 50;
  currentPage = 0;
  pages: number[] = [];
  showErrorMessage: boolean = false;
  searchStr: string = '';

  created(vm) {
    if (!this.$store.state.files.length) {
      this.$router.replace(Routes.UPLOAD);
    } else {
      this.setActiveFile(this.files[0]);
    }
  }

  get files() {
    return this.$store.state.files;
  }

  get activeFile() {
    return this.$store.state.activeFile;
  }

  get activeTranslationUnit() {
    return this.$store.state.activeTranslationUnit;
  }

  get translationUnits() {
    let translationUnits = this.$store.getters.rawTranslationUnits;

    if (this.searchStr) {
      const lowerSearchStr = this.searchStr.toLowerCase();

      translationUnits = translationUnits.filter(translationUnit => {
        const id = translationUnit.$.id.toLowerCase();
        const source = translationUnit.source[0].toLowerCase();
        const target = translationUnit.target[0].toLowerCase();
        const note = translationUnit.note[0]._.toLowerCase();

        return ~id.indexOf(lowerSearchStr) || 
          ~source.indexOf(lowerSearchStr) 
          ~target.indexOf(lowerSearchStr) 
          ~note.indexOf(lowerSearchStr);
      });
    }

    const startIdx = this.currentPage * this.maxUnitsPerPage;
    const endIdx = (this.currentPage + 1) * this.maxUnitsPerPage;

    return translationUnits.slice(startIdx, endIdx);
  }

  private setPagesNumber() {
    if (!this.translationUnits.length) {
      return;
    }

    const pagesNumber = Math.floor(this.translationUnits.length / this.maxUnitsPerPage);
    
    this.pages = [];
    for(let i = 0; i <= pagesNumber; i++) {
      this.pages.push(i);
    }

    if (this.currentPage > this.pages.length) {
      this.setActivePage(this.pages.length - 1);
    }
  }

  private setActivePage(page) {
    this.currentPage = page;
  }

  private getFileTranslationsUnits(file) {
    return getRawTranslationUnits(file);
  }

  private isActiveFile(file): boolean {
    return file.uuid === this.activeFile.uuid;
  }

  private isActiveTranslationUnit(translationUnit: any): boolean {
    if (!this.activeTranslationUnit) {
      return false;
    }

    return this.activeTranslationUnit === translationUnit;
  }

  private setActiveFile(file): void {
    this.$store.commit(CLEAR_ACTIVE_TRANSLATION_UNIT);
    this.setEmptyEditUnit();
    this.$store.commit(SET_ACTIVE_FILE, { file });
    this.setPagesNumber();
  }

  private setActiveTranslationUnit(translationUnit): void {
    this.$store.commit(SET_ACTIVE_TRANSLATION_UNIT, { translationUnit });

    this.editUnit = { 
      id: translationUnit.$.id,
      source: translationUnit.source[0],
      target: translationUnit.target[0],
      note: translationUnit.note[0]._,
    };
  }

  private setEmptyEditUnit(): void {
    this.editUnit = {
      id: null,
      source: null,
      target: null,
      note: null,
    };
  }

  private isUnitNew(unit) {
    return ~this.$store.state.newTranslationUnits.indexOf(unit.$.id);
  }

  private isUnitEdited(unit) {
    return ~this.$store.state.editedTranslationUnits.indexOf(unit.$.id);
  }

  private editCancel() {
    this.setEmptyEditUnit();
    this.$store.commit(CLEAR_ACTIVE_TRANSLATION_UNIT);
  }

  private editSave() {
    this.$store.commit(UPDATE_ACTIVE_TRANSLATION_UNIT, { translationUnit: this.editUnit });
    this.$store.commit(CLEAR_ACTIVE_TRANSLATION_UNIT);
    this.setEmptyEditUnit();
  }

  private editDelete() {
    this.$store.commit(DELETE_ACTIVE_TRANSLATION_UNIT);
    this.$store.commit(CLEAR_ACTIVE_TRANSLATION_UNIT);
    this.setEmptyEditUnit();
    this.setPagesNumber();
  }

  private onAdd() {
    this.$store.commit(CLEAR_ACTIVE_TRANSLATION_UNIT);
    this.setEmptyEditUnit();
    this.isAdding = true;
  }

  private addSave() {
    const alreadyExistsWithId = this.translationUnits.find(unit => unit.$.id === this.editUnit.id);

    if (alreadyExistsWithId) {
      this.showError();
      return;
    }

    if (!this.editUnit.id || !this.editUnit.source || !this.editUnit.target) {
      this.showError();
      return;
    }

    this.$store.commit(ADD_TRANSLATION_UNIT, { translationUnit: this.editUnit });
    this.setEmptyEditUnit();
    this.isAdding = false;
    this.setPagesNumber();
  }

  private showError() {
    this.showErrorMessage = true;

    setTimeout(() => {
      this.showErrorMessage = false;
    }, ERROR_MESSAGE_DELAY);
  }

  private addCancel() {
    this.setEmptyEditUnit();
    this.isAdding = false;
  }

  private generateXliff() {
    this.$store.dispatch('generateXliff');
  }
}
</script>
