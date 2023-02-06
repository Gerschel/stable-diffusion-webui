class AspectRatioSliderController {
    constructor(widthSlider, heightSlider, ratioSource) {
        this.widthSlider = new SliderComponentController(widthSlider);
        this.heightSlider = new SliderComponentController(heightSlider);
        this.ratioSource = new DropdownComponentController(ratioSource);
        this.widthSlider.childRangeField.addEventListener("change", (e) => { e.preventDefault(); this.resize("width"); });
        this.widthSlider.childNumField.addEventListener("change", (e) => { e.preventDefault(); this.resize("width"); });
        this.heightSlider.childRangeField.addEventListener("change", (e) => { e.preventDefault(); this.resize("height"); });
        this.heightSlider.childNumField.addEventListener("change", (e) => { e.preventDefault(); this.resize("height"); });
        this.ratioSource.childSelector.addEventListener("change", (e) => { e.preventDefault(); this.adjustStepSize(); });
    }
    resize(dimension) {
        let val = this.ratioSource.getVal();
        if (!val.includes(":")) {
            return;
        }
        let [width, height] = val.split(":").map(Number);
        let ratio = width / height;
        if (dimension == 'width') {
            this.heightSlider.setVal(Math.round(parseFloat(this.widthSlider.getVal()) / ratio).toString());
        }
        else if (dimension == "height") {
            this.widthSlider.setVal(Math.round(parseFloat(this.heightSlider.getVal()) * ratio).toString());
        }
    }
    adjustStepSize() {
        let val = this.ratioSource.getVal();
        if (!val.includes(":")) {
            return;
        }
        let [width, height] = val.split(":").map(Number);
        let gcd = this.gcd(width, height);
        let stepSize = 8 * height / gcd;
        this.widthSlider.childRangeField.step = stepSize.toString();
        this.heightSlider.childRangeField.step = stepSize.toString();
        let currentWidth = parseInt(this.widthSlider.getVal());
        let stepsTaken = Math.round(currentWidth / stepSize);
        let newWidth = stepsTaken * stepSize;
        this.widthSlider.setVal(newWidth.toString());
        this.heightSlider.setVal(Math.round(newWidth / (width / height)).toString());
    }
    gcd(a, b) {
        if (b === 0) {
            return a;
        }
        return this.gcd(b, a % b);
    }
    static observeStartup(widthSliderId, heightSliderId, ratioSourceId) {
        let observer = new MutationObserver(() => {
            let widthSlider = document.querySelector("gradio-app").shadowRoot.getElementById(widthSliderId);
            let heightSlider = document.querySelector("gradio-app").shadowRoot.getElementById(heightSliderId);
            let ratioSource = document.querySelector("gradio-app").shadowRoot.getElementById(ratioSourceId);
            if (widthSlider && heightSlider && ratioSource) {
                observer.disconnect();
                new AspectRatioSliderController(widthSlider, heightSlider, ratioSource);
            }
        });
        observer.observe(gradioApp(), { childList: true, subtree: true });
    }
}
document.addEventListener("DOMContentLoaded", () => {
    AspectRatioSliderController.observeStartup("txt2img_width", "txt2img_height", "txt2img_ratio");
    AspectRatioSliderController.observeStartup("img2img_width", "img2img_height", "img2img_ratio");
});
