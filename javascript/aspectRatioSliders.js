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
            this.heightSlider.setVal((parseInt(this.widthSlider.getVal()) / ratio).toString());
        }
        else if (dimension == "height") {
            this.widthSlider.setVal((parseInt(this.heightSlider.getVal()) * ratio).toString());
        }
    }
    adjustStepSize() {
        let val = this.ratioSource.getVal();
        if (!val.includes(":")) {
            this.widthSlider.childRangeField.step = "8";
            this.widthSlider.childRangeField.min = "64";
            this.widthSlider.childNumField.step = "8";
            this.widthSlider.childNumField.min = "64";
            this.heightSlider.childRangeField.step = "8";
            this.heightSlider.childRangeField.min = "64";
            this.heightSlider.childNumField.step = "8";
            this.heightSlider.childNumField.min = "64";
            return;
        }
        let [width, height] = val.split(":").map(Number);
        let decimalPlaces = (width.toString().split(".")[1] || []).length;
        decimalPlaces = decimalPlaces > 6 ? 6 : decimalPlaces;
        let gcd = this.gcd(width * 10 ** decimalPlaces, height * 10 ** decimalPlaces) / 10 ** decimalPlaces;
        let stepSize = 8 * height / gcd;
        let stepSizeOther = 8 * width / gcd;
        this.widthSlider.childRangeField.step = stepSizeOther.toString();
        this.widthSlider.childRangeField.min = stepSizeOther.toString();
        this.widthSlider.childNumField.step = stepSizeOther.toString();
        this.widthSlider.childNumField.min = stepSizeOther.toString();
        this.heightSlider.childRangeField.step = stepSize.toString();
        this.heightSlider.childRangeField.min = stepSize.toString();
        this.heightSlider.childNumField.step = stepSize.toString();
        this.heightSlider.childNumField.min = stepSize.toString();
        let currentWidth = parseInt(this.widthSlider.getVal());
        let stepsTaken = Math.round(currentWidth / stepSizeOther);
        let newWidth = stepsTaken * stepSizeOther;
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
