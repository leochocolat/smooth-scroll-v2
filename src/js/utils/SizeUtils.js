class SizeUtils {
    
    constructor() {
        this.COVER = 'size:cover';
        this.CONTAIN = 'size:contain';
    }

    getSize(containerWidth, containerHeight, elementWidth, elementHeight, method) {
        var mathMethod = (method === this.CONTAIN) ? Math.min : Math.max;    

        var scale = mathMethod(containerWidth / elementWidth, containerHeight / elementHeight);

        var width = Math.ceil(elementWidth * scale);           
        var height = Math.ceil(elementHeight * scale);      

        var values =  {
            x: (containerWidth - width) * 0.5 >> 0, 
            y: (containerHeight - height) * 0.5 >> 0, 
            width: width, 
            height: height, 
            scale: scale                
        };            

        values.cssText = ''.concat('left:', values.x, 'px; top:', values.y, 'px; width:', values.width, 'px; height:', values.height, 'px;');

        return values;
    }

}

export default new SizeUtils();