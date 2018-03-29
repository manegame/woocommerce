=== Admin Menu Post List ===
Contributors: miyarakira
Author: Eliot Akira
Author URI: eliotakira.com
Plugin URI: wordpress.org/plugins/admin-menu-post-list/
Tags: admin, menu, admin menu, post, page, custom post type, list, view
Requires at least: 3.6
Tested up to: 4.1
Stable tag: 2.0.1
License: GPLv2 or later

Display a post list in the admin menu

== Description ==

**Admin Menu Post List** adds a simple post list in the admin menu for easy access. It supports posts, pages, and custom post types.

In the normal admin menu, when you're editing a post and wish to go to another one, you have to click on All Posts, then select a post -- or have All Posts open on another browser tab. With the Admin Menu Post List, you can just select the next post to edit, direct from the menu.

* Install and activate the plugin
* Go to *Settings->Post List*, enable post types and options

A post list will be added to the bottom of each corresponding post type's menu. You can see it by hovering over the menu item, or when the item is open. The current post is shown in **bold**, draft/pending posts are in *italics*, and child pages are listed under the parent.

= Options =  
<br />
For each post type, you can limit the number of items to display: for example, the five most recent posts.

You can choose to order the post list by:

* *created* - order by date created
* *modified* - order by date modified
* *title* - order by title

And the direction of the order:

* *ASC* - ascending - alphabetical (1, 2, 3; a, b, c)
* *DESC* - descending - new to old (3, 2, 1; c, b, a)

By default, they are set to display from most recent to older posts.

Also, you can choose to display only published posts, and exclude those with future, draft or pending status.

Global settings:

* *Limit title length* - trim the title by number of characters
* *Child posts in dropdown* - put child posts in a dropdown list

= Recommended =  
<br />
[Wider Admin Menu](http://wordpress.org/plugins/wider-admin-menu/)

= Note =  
<br />
There is a plugin called [Intuitive Custom Post Order](http://wordpress.org/plugins/intuitive-custom-post-order/), which lets you order posts by drag and drop. If it's installed, it overrides the post order settings in the admin menu also.

== Installation ==

1. Install from *Plugins->Add New*
1. Activate the plugin
1. Go to *Settings->Post List*, enable post types and options

== Frequently Asked Questions ==

= Any Questions? =

Not yet.

== Screenshots ==

1. Settings page

2. Menu on hover

3. When menu is open


== Changelog ==

= 2.0.1 =

* Test compatibility with WP 4.1
* Improve style for long title and dropdown
* Display placeholder text when there's no title

= 2.0 =

* Test compatibility with WP 4.0
* Eliminate PHP notice

= 1.9 =

* Organize and clean up code
* Improve style for post list and settings page
* Option to put child posts in a dropdown list
* Show grandchildren with another indent

= 1.6 =

* Improve line-height
* Get all child posts

= 1.5 =

* Filter child posts by published status

= 1.4 =

* Compatibility with multi-byte languages, i.e., Japanese
* Compatibility with WP Admin UI Customize

Update courtesy of gqevu6bsiz - thank you!

= 1.3 =

* Added option to sort by last modified date

= 1.2 =

* Improved code so no PHP notices are displayed when debug is on

= 1.1 =

* Improved color and position of separator

= 1.0 =

* Limit number of posts to 25 when max items is 0=all. With a large number of posts, this will prevent the plugin from processing them all.

= 0.9 =

* Added link to settings page in the plugin overview

= 0.8 =

* Added option to display only published posts, and exclude those with future, draft or pending status

= 0.7 =

* Limit length of post title to one line
* Added option to order post list by date/title, and ASC/DESC

= 0.6 =

* Added option to limit the number of posts to list

= 0.5 =

* First release
* Settings page
* Support child pages

