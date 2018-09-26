<template>
<div>
  <div class="_overlay" v-if="this.isUploading">
    <div class="ui active inverted dimmer">
    <div class="ui indeterminate text loader">Preparing Files</div>
    </div>
  </div>

  <div class="ui padded container segment" v-show="!this.isUploading">
      <h2 class="ui header" >
        <vue-dropzone id="dropzone"
          :options="dropzoneOptions"
          @vdropzone-file-added="onAdded"
          @vdropzone-success="onSuccess">
        </vue-dropzone>
      </h2>
  </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import vue2Dropzone from 'vue2-dropzone';
import 'vue2-dropzone/dist/vue2Dropzone.min.css';
import File from '../models/File';
import { SAVE_FILES } from '../constants/actions';
import * as Routes from '../constants/routes';
import * as Api from '../constants/api';

@Component({
  components: {
    VueDropzone: vue2Dropzone,
  },
})
export default class Upload extends Vue {
  private dropzoneOptions: any;
  private isUploading: boolean;
  private files: string[];
  private uploadedFiles: File[];

  constructor() {
    super();

    this.isUploading = false;
    this.files = [];
    this.uploadedFiles = [];
    this.dropzoneOptions = {
      url: Api.API_UPLOAD,
      previewsContainer: false,
    };
  }

  private onAdded(event: any) {
    const { filename } = event.upload;
    this.files.push(filename);
    this.isUploading = true;
  }

  private onSuccess(event: any) {
    const { uuid, filename } = event.upload;
    const { response } = event.xhr;
    const { xliff } = JSON.parse(response);
    this.uploadedFiles.push(new File(uuid, filename, xliff));

    if (this.files.length === this.uploadedFiles.length) {
      this.$store.commit(SAVE_FILES, { files: this.uploadedFiles });
      this.$router.push(Routes.EDITOR);
      this.isUploading = false;
    }
  }
}
</script>
