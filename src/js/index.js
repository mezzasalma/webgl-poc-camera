import { App } from "./App";

const canvas = document.getElementById('app-canvas')
const app = new App(canvas)
app.init()
app.run()

