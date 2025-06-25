/**
 * H5 Script SDK sample.
 */
/**
 * Adds label, textbox, combobox, checkbox, and button elements
 * On button click, toggles the checkbox and prints the textbox and combobox values on the console
 */
var H5SampleAddElements = /** @class */ (function () {
    function H5SampleAddElements(scriptArgs) {
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
        this.args = scriptArgs.args;
    }
    H5SampleAddElements.Init = function (args) {
        new H5SampleAddElements(args).run();
    };
    H5SampleAddElements.prototype.run = function () {
        this.contentElement = this.controller.GetContentElement();
        this.addLabel();
        this.addTextBox();
        this.addComboBox();
        this.addCheckbox();
        this.addButton();
    };
    H5SampleAddElements.prototype.addLabel = function () {
        var labelElement = new LabelElement();
        labelElement.Name = "testLabel";
        labelElement.Value = "Test Elements";
        labelElement.Position = new PositionElement();
        labelElement.Position.Top = 5;
        labelElement.Position.Left = 6;
        this.contentElement.AddElement(labelElement);
    };
    H5SampleAddElements.prototype.addTextBox = function () {
        var textElement = new TextBoxElement();
        textElement.Name = "testTextBox";
        textElement.Value = "Test";
        textElement.Position = new PositionElement();
        textElement.Position.Top = 5;
        textElement.Position.Left = 14;
        textElement.Position.Width = 5;
        this.contentElement.AddElement(textElement);
    };
    H5SampleAddElements.prototype.addComboBox = function () {
        var items = [
            { key: '1', value: 'One', selected: true },
            { key: '2', value: 'Two', selected: false },
            { key: '3', value: 'Three', selected: false },
            { key: '4', value: 'Four', selected: false },
            { key: '5', value: 'Five', selected: false },
        ];
        var comboBox = new ComboBoxElement();
        comboBox.Name = "testComboBox";
        comboBox.Position = new PositionElement();
        comboBox.Position.Top = 5;
        comboBox.Position.Left = 18;
        comboBox.Position.Width = 8;
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            var cboxItem = new ComboBoxItemElement();
            cboxItem.Value = item.key;
            cboxItem.Text = item.value;
            if (item.selected) {
                cboxItem.IsSelected = true;
            }
            comboBox.Items.push(cboxItem);
        }
        this.contentElement.AddElement(comboBox);
    };
    H5SampleAddElements.prototype.addCheckbox = function () {
        var cbElement = new CheckBoxElement();
        cbElement.Name = "testCheckBox";
        cbElement.Position = new PositionElement();
        cbElement.Position.Top = 5;
        cbElement.Position.Left = 26;
        cbElement.IsChecked = false;
        this.contentElement.AddElement(cbElement);
    };
    H5SampleAddElements.prototype.addButton = function () {
        var _this = this;
        var buttonElement = new ButtonElement();
        buttonElement.Name = "testButton";
        buttonElement.Value = "Print and Toggle";
        buttonElement.Position = new PositionElement();
        buttonElement.Position.Top = 5;
        buttonElement.Position.Left = 28;
        buttonElement.Position.Width = 5;
        var $button = this.contentElement.AddElement(buttonElement);
        $button.click({}, function () {
            var $textBox = $("#testTextBox");
            var $selected = $("#testComboBox").find('option:selected');
            var $cbox = $('#testCheckBox');
            _this.log.Info("Text value: ".concat($textBox.val()));
            _this.log.Info("Selected option: ".concat($selected.val(), " (").concat($selected.text(), ")"));
            if (ScriptUtil.version >= 2.0) {
                var cboxId = 'testCheckBox';
                var controller = _this.controller;
                var value = ScriptUtil.GetFieldValue(cboxId, controller);
                ScriptUtil.SetFieldValue('testCheckBox', !value, _this.controller);
            }
            else {
                $cbox.toggleChecked();
            }
        });
    };
    return H5SampleAddElements;
}());
//# sourceMappingURL=H5SampleAddElements.js.map