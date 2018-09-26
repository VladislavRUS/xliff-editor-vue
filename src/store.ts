import Vue from 'vue';
import Vuex from 'vuex';
import { getRawTranslationUnits } from '@/helpers/getRawTranslationUnits';
import axios from 'axios';
import * as Api from './constants/api';
import FileSaver from "file-saver"

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    files: [],
    activeFile: null,
    activeTranslationUnit: null,
    newTranslationUnits: [],
    editedTranslationUnits: [],
    isGenerating: false
  },
  mutations: {
    saveFiles(state, { files }) {
      state.files = files;
    },
    setActiveFile(state, { file }) {
      state.activeFile = file;
    },
    setActiveTranslationUnit(state, { translationUnit }) {
      state.activeTranslationUnit = translationUnit;
    },
    clearActiveTranslationUnit(state) {
      state.activeTranslationUnit = null;
    },
    updateActiveTranslationUnit(state, { translationUnit }) {
      state.activeTranslationUnit.$.id = translationUnit.id.trim();
      state.activeTranslationUnit.source[0] = translationUnit.source.trim();
      state.activeTranslationUnit.target[0] = translationUnit.target.trim();
      state.activeTranslationUnit.note[0]._ = translationUnit.note.trim();

      state.editedTranslationUnits.push(state.activeTranslationUnit.$.id);
    },
    deleteActiveTranslationUnit(state) {
      const rawTranslationUnits = getRawTranslationUnits(state.activeFile);
      const unitIdx = rawTranslationUnits.indexOf(state.activeTranslationUnit);
      rawTranslationUnits.splice(unitIdx, 1);
    },
    addTranslationUnit(state, { translationUnit }) {
      const rawTranslationUnits = getRawTranslationUnits(state.activeFile);
      
      const newUnit = { $: {
        id: translationUnit.id
      }, source: [
        translationUnit.source
      ], target: [
        translationUnit.target
      ], note: [
        {
          _: translationUnit.note
        }
      ]};

      rawTranslationUnits.push(newUnit);
      state.newTranslationUnits.push(newUnit.$.id);
    }
  },
  getters: {
    rawTranslationUnits: (state: any) => {
      if (!state.files.length) {
        return;
      }

      return getRawTranslationUnits(state.activeFile);
    },
    translationUnits: (state: any) => {
      return state.getters.rawTranslationUnits.map((unit) => ({
        id: unit.$.id,
        source: unit.source[0],
        target: unit.target[0],
        notes: unit.notes[0],
      }));
    },
  },
  actions: {
    generateXliff({ commit, state }) {
      state.isGenerating = true;

      axios.post(Api.API_XLIFFS, {
        xliff: state.activeFile.xliff
      }, {
        headers: {
          'Accept': 'application/xml'
        }
      }).then(resp => {
        const blob = new Blob([resp.data]);
        FileSaver(blob, state.activeFile.name);
        state.isGenerating = false;
      });
    },
    generateJson({ commit, state}) {
      const rawTranslationUnits = getRawTranslationUnits(state.activeFile);
      const jsonUnits = {};

      rawTranslationUnits.forEach(unit => {
        const id = unit.$.id;
        const target = unit.target[0];

        jsonUnits[id] = target;
      });

      const fileName = state.activeFile.name;
      const dotIdx = fileName.lastIndexOf('.');
      const name = fileName.substring(0, dotIdx) + '.json';
      const blob = new Blob([JSON.stringify(jsonUnits)]);
      FileSaver(blob, name);
    },
  }
});
