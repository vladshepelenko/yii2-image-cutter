$.fn.cutter = function (options) {
    'use strict';

    var $uploadField = $(this);

    var $inputField = options['inputField'];
    var $jcropOptions = options['jcropOptions'];

    var $cutter = $('#' + $inputField + '-cutter');
    var $modal = $cutter.find('.modal');
    var $imageContainer = $cutter.find(".image-container");
    var $imageID = $imageContainer.find("img").attr('id');
    var $previewPane = $cutter.find('.preview-pane');
    var $preview = $cutter.find('.preview-image');

    var $dataX = $('#' + $inputField + '-dataX'),
        $dataY = $('#' + $inputField + '-dataY'),
        $dataHeight = $('#' + $inputField + '-dataHeight'),
        $dataWidth = $('#' + $inputField + '-dataWidth'),
        $dataRotate = $('#' + $inputField + '-dataRotate');

    var $defaultJcropOptions = {
        crop: function (data) {
            $dataX.val(Math.round(data.x));
            $dataY.val(Math.round(data.y));
            $dataHeight.val(Math.round(data.height));
            $dataWidth.val(Math.round(data.width));
            $dataRotate.val(Math.round(data.rotate));
        }
    };

    $(document.body).on('click', '[data-method]', function () {
        var data = $(this).data(),
            $target,
            result;

        if (data.method) {
            data = $.extend({}, data);

            if (typeof data.target !== 'undefined') {
                $target = $(data.target);

                if (typeof data.option === 'undefined') {
                    if (data.method == 'setAspectRatio') {
                        var targetVal = $target.val().replace("/\D\/+/g","");
                        var split = targetVal.split('/');

                        if (split.length == 2) {
                            data.option = split[0] / split[1];
                        } else {
                            data.option = parseFloat($target.val());
                        }
                    }
                }
            }

            if (data.method == 'setData') {
                data.option = {
                    "x": parseFloat($dataX.val()),
                    "y": parseFloat($dataY.val()),
                    "width": parseFloat($dataWidth.val()),
                    "height": parseFloat($dataHeight.val()),
                    "rotate": parseFloat($dataRotate.val())
                };
            }

            result = $('#' + $imageID).cropper(data.method, data.option);

            if ($.isPlainObject(result) && $target) {
                try {
                    $target.val(JSON.stringify(result));
                } catch (e) {
                    console.log(e.message);
                }
            }

        }

        return false;
    });

    $uploadField.change(function (e) {
        var file = e.target.files[0],
            imageType = /image.*/;

        if (!file.type.match(imageType)) {
            return;
        }

        var reader = new FileReader();

        reader.onload = fileOnload;
        reader.readAsDataURL(file);
    });

    $('#' + $imageID + '_button_accept').on('click', function () {
        var cropped = false;

        var data = $('#' + $imageID).cropper('getData');

        $.each(data, function () {
            if (this != 0) {
                cropped = true;
            }
        });

        if (!cropped) {
            $preview.prop('src', $('#' + $imageID).prop('src'));
        } else {
            var canvas = $('#' + $imageID).cropper('getCroppedCanvas');
            var dataURL = canvas.toDataURL();

            $preview.prop('src', dataURL);
        }

        $previewPane.show();

        remove();

        $modal.modal('hide');
    });

    $('#' + $imageID + '_button_cancel').on('click', function () {
        remove();

        $modal.modal('hide');
    });

    $modal.on('hidden.bs.modal', function (a) {
        remove();
    });

    function remove() {
        $imageContainer.find(".cropper-container").remove();

        $('#' + $imageID).removeAttr("src").removeAttr("style").removeClass("cropper-hidden");
    }

    function fileOnload(e) {
        var imageField = $imageContainer.find('img').prop('outerHTML');

        $imageContainer.html('').append(imageField);

        $('#' + $imageID).prop('src', e.target.result.toString()).hide();

        $modal.on('shown.bs.modal', function (a) {
            var size = getImageContainerSize();

            $imageContainer.css({
                width: size.width + 'px',
                height: size.height + 'px'
            });

            var options = $.extend({}, $jcropOptions, $defaultJcropOptions);

            $('#' + $imageID).cropper(options);
        });

        $modal.modal('show');
    }

    function getImageContainerSize() {
        var height, aspectRatio = 1;
        var width = $imageContainer.width();
        var minHeight = 100;

        var imageWidth = $('#' + $imageID).width();
        var imageHeight = $('#' + $imageID).height();

        if (imageWidth > imageHeight) {
            aspectRatio = imageWidth / width;
            height = imageHeight / aspectRatio;
        }

        if (imageWidth < imageHeight) {
            if (imageWidth < width) {
                width = imageWidth;
                height = imageHeight;
            } else {
                aspectRatio = imageWidth / width;
                height = imageHeight / aspectRatio;
            }
        }

        if (imageWidth == imageHeight) {
            if (imageWidth < width) {
                height = imageHeight;
            } else {
                height = width;
            }

            if (height < minHeight) {
                height = minHeight;
            }
        }

        return {
            'width': width,
            'height': height
        }
    }
};