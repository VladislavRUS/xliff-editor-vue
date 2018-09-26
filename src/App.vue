<template>
  <div>
    <div class="ui stackable menu">
    <div class="item">
      <img src="./assets/xliff-editor-logo.png">
    </div>
    <router-link class="item" to="/">Upload file</router-link>
    <router-link class="item" to="/editor">Editor</router-link>
    </div>
    <router-view/>
  </div>
</template>