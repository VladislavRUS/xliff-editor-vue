import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    files: [],
    activeFile: null,
    activeTranslationUnit: null,
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
      const rawUnit = state.getters.rawTranslationUnits.find(unit => unit.$.id === translationUnit.id);
      rawUnit.source[0] = translationUnit.source;
      rawUnit.source[0] = translationUnit.source;
      rawUnit.source[0] = translationUnit.source;
      rawUnit.source[0] = translationUnit.source;
    },
  },
  getters: {

    rawTranslationUnits: (state: any) => {
      const xliff = state.activeFile.xliff;
      const file = xliff.file[0];
      const body = file.body[0];
      const rawTranslationUnits = body['trans-unit'];

      return rawTranslationUnits;
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
});
