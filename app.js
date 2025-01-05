require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { send } = require('express/lib/response');
const res = require('express/lib/response');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

const today = 'Today';

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/static'));

mongoose.connect(process.env.API);

// mongoose.connect('mongodb://localhost:27017/todolistDB');

const itemsSchema = new mongoose.Schema({
	name: String,
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
	name: 'Buy Food',
});

const item2 = new Item({
	name: 'Cook Food',
});

const item3 = new Item({
	name: 'Buy Food',
});

const defaultItems = [item1, item2, item3];

const listSchema = {
	name: String,
	items: [itemsSchema],
};

const List = mongoose.model('List', listSchema);

app.get('/', (req, res) => {
	Item.find((err, foundItems) => {
		if (foundItems.length === 0) {
			Item.insertMany(defaultItems, er => {
				if (er) {
					console.log('error');
				} else {
					console.log('Successfully');
				}

				res.redirect('/');
			});
		} else {
			res.render('list', { listTitle: today, newListItems: foundItems });
			console.log(foundItems);
		}
	});
});

app.get('/:customListName', (req, res) => {
	const customListName = _.capitalize(req.params.customListName);

	List.findOne({ name: customListName }, (err, listName) => {
		if (!err) {
			if (!listName) {
				//Create New List
				const list = new List({
					name: customListName,
					items: defaultItems,
				});

				list.save();

				res.redirect('/' + customListName);
			} else {
				// Show Existing List

				res.render('list', {
					listTitle: listName.name,
					newListItems: listName.items,
				});
			}
		}
	});
});

app.post('/', (req, res) => {
	const itemName = req.body.inputItem;

	const listTitle = req.body.list;

	const item = new Item({
		name: itemName,
	});

	if (listTitle === 'Today') {
		item.save();
		res.redirect('/');
	} else {
		List.findOne({ name: listTitle }, (err, foundList) => {
			foundList.items.push(item);
			foundList.save();
			res.redirect('/' + listTitle);
		});
	}
});

app.post('/delete', (req, res) => {
	const listName = req.body.listNumber;
	const checboxth = req.body.checkboxthatgot;
	console.log(checboxth);

	if (listName === 'Today') {
		Item.findByIdAndRemove(checboxth.trim(), function (e) {
			if (!e) {
				console.log('right');
				res.redirect('/');
			} else {
				console.log(e);
			}
		});
	} else {
		List.findOneAndUpdate(
			{ name: listName },
			{ $pull: { items: { _id: checboxth.trim() } } },
			function (err, foundList) {
				if (!err) {
					res.redirect('/' + listName);
				} else {
					console.log(err);
				}
			}
		);
	}
});

app.get('/about', (req, res) => {
	res.render('about');
});

let port = process.env.PORT;
if (port == null || port == '') {
	port = 3000;
}

app.listen(port, function () {
	console.log('Server is Running on port 3000');
});
