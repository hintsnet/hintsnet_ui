/*
 * index.js
 */

console.log("JavaScript 真棒！");

// 修复 js 内置的取余数方法，使其符合数学定义
// 例： math_mod(-5, 3) = 1
// 参见 https://www.khanacademy.org/computing/computer-science/cryptography/modarithmetic/a/what-is-modular-arithmetic
function math_mod(num, divisor) {
	return ((num % divisor) + divisor) % divisor;
}

// 在 math_mod 方法基础上，实现专门针对 Javascript
// 列表下标的取余方法（目的：实现循环下标）
// 若 divisor 为 3，那么对下列数字取模后将得到：
// -4 -3 -2 -1  0  1  2  3  4 
//  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓  ↓ 
//  2  0  1  2  0  1  2  0  1
function js_array_index_mod(num, divisor) {
	return math_mod(
		math_mod(num + 1, divisor) - 1 + divisor,
		divisor);
}

// 截取当前时间戳中的 时:分:秒部分
function timestamp_hms() {
	hms = Date().split(' ')[4];
	return hms;
}

// 获取指定的“卡片盒”在页面上的显示位置序号（0, 1, 2）
function getBoxIndex(this_box) {
	return this_box.index();
}

// 获取当前卡片所属的卡片盒的显示位置序号（0, 1, 2）
function getBoxIndexByCard(this_card) {
	this_box = this_card.parent();
	this_box_id = getBoxIndex(this_box);
	return this_box_id;
}

// 获取指定的“卡片”在页面上的显示位置序号（0, 1, 2）
function getCardIndex(this_card) {
	return this_card.index();
}

// 获取左、中、右三个卡片盒
// 0 对应左侧卡片盒的 jQuery 对象，
// 1 对应中央，2 对应右侧
function getAllBoxes() {
	focus_tracking_area = $('.focus_tracking_area');
	left = focus_tracking_area.children().first();
	center = left.next();
	right = center.next();
	return [left, center, right];
}

// 获取左、中、右三个卡片盒，及其内部卡片的 css class
// 0 对应左侧卡片盒的 css class，
// 1 对应中央，2 对应右侧
function getAllBoxAndCardClasses() {
	boxes = getAllBoxes();
	return [
			{'box_class': boxes[0].attr('class'),
			 'card_class': boxes[0].children().first().attr('class')
			},
			{'box_class': boxes[1].attr('class'),
			 'card_class': boxes[1].children().first().attr('class')
			},
			{'box_class': boxes[2].attr('class'),
			 'card_class': boxes[2].children().first().attr('class')
			},
		];
}

// 当卡片或卡片盒移动位置，需要改变皮肤时，
// 可以用这个方法为其切换 css class。
function switchClass(a_box_or_card, src_class, dst_class) {
	a_box_or_card.css({'transition':'all 0.5s'});
	a_box_or_card.removeClass(src_class);
	a_box_or_card.addClass(dst_class).delay(1000).queue(
		function(){
			$(this).css({'transition':''}).dequeue();
		});
}

// 用于生成“卡片”左、右滑动的转场动画
function cardSlide(this_card, direction) {
	this_box_id = getBoxIndexByCard(this_card);
	this_card_class = this_card.attr('class');
	if (direction === 'left') {
		next_card_class = box_and_card_classes[
			js_array_index_mod(this_box_id - 1, box_and_card_classes.length)
			].card_class;
	} else if (direction === 'right') {
		next_card_class = box_and_card_classes[
			js_array_index_mod(this_box_id + 1, box_and_card_classes.length)
			].card_class;
	}
	switchClass(this_card, this_card_class, next_card_class);
}

// 用于生成“卡片盒”左、右滑动的转场动画
function boxSlide(this_box, active_card_id, direction) {
	this_box_id = getBoxIndex(this_box);
	this_box_class = this_box.attr('class');
	cards_inside = this_box.children();
	if (direction === 'left') {
		next_box_class = box_and_card_classes[
			js_array_index_mod(this_box_id - 1, box_and_card_classes.length)
			].box_class;
	} else if (direction === 'right') {
		next_box_class = box_and_card_classes[
			js_array_index_mod(this_box_id + 1, box_and_card_classes.length)
			].box_class;
	}
	switchClass(this_box, this_box_class, next_box_class);
	cards_inside.each(
		function() {
			// 对卡片盒内的卡片做同方向的滑动操作
			if (direction === 'left') {
				if (this_box_id === 2 && active_card_id !== getCardIndex($(this))) {
					$(this).hide();
				} else {
					$(this).show();
				}
				cardSlide($(this),'left');
			} else if (direction === 'right') {
				if (this_box_id === 0 && active_card_id !== getCardIndex($(this))) {
					$(this).hide();
				} else {
					$(this).show();
				}
				cardSlide($(this),'right');
			}
		}
	);
}

// 用于生成“卡片”消失的转场动画
// 当卡片位于最左侧，左滑时将会呈现消失动画
// 当卡片位于最右侧，右滑时将会呈现消失动画
function cardShrinkOut(this_card) {
	this_card.animate(
		{ 'width':'0', 'height':'0' },
		400,
		function() { $(this).remove(); }
	);
}

// 用于生成“卡片盒”消失的转场动画
// 当卡片盒位于最左侧，左滑时将会呈现消失动画
// 当卡片盒位于最右侧，右滑时将会呈现消失动画
function boxShrinkOut(this_box) {
	cards_inside = this_box.children();
	cards_inside.each(
		function() { cardShrinkOut($(this)); }
	);
	this_box.hide();
	this_box.delay(600).queue(
		function() { $(this).remove().dequeue(); }
	);
}

// 在当前布局的基础上，在左侧增加一列卡片
function addLeftBoxAndCard() {
	focus_tracking_area = $('.focus_tracking_area');
	timestamp = timestamp_hms();
	focus_tracking_area.prepend(
		'<div class="left_link_cards_container">' +
		'\t<div class="left_link_card">' + timestamp + '</div>' +
		'\t<div class="left_link_card">...</div>' +
		'</div>'
	);
	focus_tracking_area.children().first().hide().show(1500);
}

// 在当前布局的基础上，在右侧增加一列卡片
function addRightBoxAndCard() {
	focus_tracking_area = $('.focus_tracking_area');
	timestamp = timestamp_hms();
	focus_tracking_area.append(
		'<div class="right_link_cards_container">' +
		'\t<div class="right_link_card">' + timestamp + '</div>' +
		'\t<div class="right_link_card">...</div>' +
		'</div>'
	);
	focus_tracking_area.children().last().hide().show(1500);
}

// 为所有左侧卡片和右侧卡片添加点击事件
// 点击后卡片焦点将会切换，具体的切换方式
// 在 focusShift 方法中定义
function addClickEvents() {
	$('.left_link_card').click(
		function() { focusShift($(this)); });
	$('.right_link_card').click(
		function() { focusShift($(this)); });
}

// 基于之前定义的各种基础方法，实现“注意力焦点”切换过程
// 即：点击左侧或右侧卡片后发生的一系列转场过程
function focusShift(this_card) {
	this_box = this_card.parent();
	this_box_id = getBoxIndexByCard(this_card);
	this_card_id = getCardIndex(this_card);
	switch(this_box_id) {
		case 0: // 当最左侧的卡片被点击时，执行下列操作
			left = this_box;
			center = this_box.next();
			right = center.next();
			boxShrinkOut(right);  // 右端卡片消失
			boxSlide(center,this_card_id,'right');  // 中部卡片右滑
			boxSlide(left,this_card_id,'right'); // 左端卡片右滑
			// 若最左端已没有额外的卡片，就随机添加一组
			if (left.prev().length < 1) {  
				addLeftBoxAndCard();
			}
			addClickEvents();
			break;
		case 2: // 当最右侧的卡片被点击时，执行下列操作
			right = this_box;
			center = this_box.prev();
			left = center.prev();
			boxShrinkOut(left);  // 左端卡片消失
			boxSlide(center,this_card_id,'left');  // 中部卡片左滑
			boxSlide(right,this_card_id,'left'); // 右端卡片左滑
			// 若最右端已没有额外的卡片，就随机添加一组
			if (right.next().length < 1) {
				addRightBoxAndCard();
			}
			addClickEvents();
			break;
	}
}

// --- 主体代码由此开始 ---

// 在页面初始化的阶段，获取所有卡片盒与卡片的 css class
var box_and_card_classes = getAllBoxAndCardClasses();

// 初始化卡片的点击事件
addClickEvents();

// 初始化底部参考资料卡片盒的点击事件
$('.ref_cards_container').click(
	function() {
		console.log('目前尚未实现');
	});

