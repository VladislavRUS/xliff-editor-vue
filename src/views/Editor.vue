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
            123
          </div>
        </a>

        <div class="item">
          <div class="ui fluid icon input transparent">
            <input type="text" placeholder="Search..." >
            <i class="search icon"></i>
          </div>
        </div>

        <div class="item">
          <div class="ui fluid buttons">
            <button class="ui primary button">Generate XLIFF</button>
          </div>
        </div>

        <div class="item">
          <div class="ui fluid buttons">
            <button class="ui positive button">Add unit</button>
          </div>
        </div>

        <div class="item" v-if="activeTranslationUnit !== null">
          <div class="ui fluid buttons">
            <button class="ui teal button">Save</button>
            <button class="ui button" @click="editCancel()">Cancel</button>
          </div>

        </div>
        <div class="item">
          <div class="ui fluid buttons">
            <button class="ui negative button">Delete</button>
          </div>
        </div>
      </div>
    </div>
  <div class="thirteen wide column" id="stickyContext">
     <table class="ui fixed single line selectable compact table">
        <thead>
          <tr>
            <th colspan="4">
              <div class="ui right floated pagination menu">
                <a class="icon item">
                  <i class="left chevron icon"></i>
                </a>
                <!-- <a class="item" *ngFor="let page of pages" (click)="setActivePage(page)" [ngClass]="{'active': page === currentPage}">
                  {{page + 1}}
                </a> -->
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
                {{translationUnit.id}}
              </td>
              <td>{{translationUnit.source}}</td>
              <td>{{translationUnit.target}}</td>
              <td>{{translationUnit.notes}}</td>
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
                    <textarea type="text" rows="3" v-model="editUnit.notes"></textarea>
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
  UPDATE_ACTIVE_TRANSLATION_UNIT } from '../constants/actions';

@Component({})
export default class Editor extends Vue {

  editUnit: any;

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
    return this.$store.getters.translationUnits;
  }

  constructor() {
    super();
    this.$store.commit(SET_ACTIVE_FILE, { file: this.files[0] });
    this.setEmptyEditUnit();
  }

  private isActiveFile(file): boolean {
    return file.uuid === this.activeFile.uuid;
  }

  private isActiveTranslationUnit(translationUnit: any): boolean {
    if (!this.activeTranslationUnit) {
      return false;
    }

    return this.activeTranslationUnit.id === translationUnit.id;
  }

  private setActiveFile(file): void {
    this.$store.commit(SET_ACTIVE_FILE, { file });
  }

  private setActiveTranslationUnit(translationUnit): void {
    this.$store.commit(SET_ACTIVE_TRANSLATION_UNIT, { translationUnit });
    this.editUnit = { ...translationUnit };
  }

  private setEmptyEditUnit(): void {
    this.editUnit = { 
      id: null,
      source: null,
      target: null,
      notes: null,
    };
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
}
</script>
