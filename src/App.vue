<template>
  <div class="app-container">
    <router-view></router-view>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #000;
  color: #fff;
}

.app-container {
  width: 100%;
  height: 100vh;
}
</style>
