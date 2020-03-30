# DeepaMehta 5 search/create widget

## Version History

**0.28** -- Mar 30, 2020

* Mobile friendly layout (optional)

**0.27** -- Nov 22, 2019

* Feature: Advanced Search
    * Restrict search result to certain topic type
        * Customizable type menu
    * Optionally include child topics in search
* Improvements:
    * Drop `pos` component prop; dialog opens at standard position
        * Original click position is still used for revealed/created topic placement
    * Trim user input before create

**0.26** -- Aug 16, 2019

* Improvements:
    * Combine search terms via AND (instead OR)
    * Don't perform single character search
    * Don't transform user input if it contains Lucene special symbol
* Fixes:
    * Do not show out-of-date search result

**0.25** -- Jul 22, 2019

* Chore:
    * Adapt to `dm5` library (`searchTopics()` -> `queryTopicsFulltext()`)
    * Change license to `AGPL-3.0`

**0.24** -- May 28, 2019

* Improvement: HTML topics in search results are rendered, instead displaying source (due to upgraded `dm5-topic-list` dependency)

**0.23** -- Apr 22, 2019

* Chore: lock `dm5-` dependencies (for releasing DMX-5.0-beta.2)

**0.22** -- Apr 1, 2019

* Chore: bump dependency version numbers to snapshots

**0.21** -- Jan 29, 2019

* Improvements:
    * Show icons for the "Create" menu's special items
    * When opening the dialog the search field content is selected
    * Pressing Return in search field triggers "Create" button
    * The dialog is modal; pressing ESC closes it
    * The dialog has a close box
* Change license to `GPL-3.0-or-later`

**0.20** -- Dec 21, 2018

* Show type icons in "Create" menu
* Revise "Create" menu (option groups)
* Retype component property `menu-topic-types` to Array (formerly Object) to support sort order

**0.19** -- Nov 24, 2018

* Improvement: debounce search requests

**0.18** -- Oct 21, 2018

* Return to no-tabs layout

**0.17** -- Oct 6, 2018

* New component property `markerIds` allows rendering certain search result topics as "marked"
* Component supports manual mounting in conjunction with manual data update ("props" are mirrored as "data")
* Fix: update search result on show dialog

**0.16** -- Sep 30, 2018

* New component prop `createEnabled` controls whether the "Create" tab is enabled

**0.15** -- Aug 22, 2018

* Composability:
    * The component emits events instead of dispatching into the host application. Events and their args:
        * `topic-reveal`  topic
        * `topic-create`  {topicType, value}
        * `extra-create`  {extraItem, value, optionsData}
        * `close`         -
    * The component receives app state via props instead of maintaining a Vuex store module on its own.
        * No Vuex dependency anymore

**0.14** -- Aug 18, 2018

* Pass widget `pos` to extra menu item `create` callback
* Fix: process directives on create-topic

**0.13** -- Jul 31, 2018

* Add GitLab CI/CD

**0.12** -- May 1, 2018

* Adapt Element UI overrides

**0.11** -- Apr 10, 2018

* 2-tab layout: "Search" and "Create"

**0.10** -- Mar 25, 2018

* New concept: the extra menu items can provide a "Create Options Component" to solicit further data from the user before creating the topic.
* Dependencies: `dm5-topic-list` replaces `el-table` as the result list component. Build size decreases by 100 KiB!

**0.9** -- Mar 22, 2018

* New option `topicHandler` replaces `auxAction`. Allows the handler and the `openSearchWidget` call to exist in the same closure.

**0.8** -- Jan 13, 2018

* Minor layout change

**0.7** -- Dec 5, 2017

* Adapt to Element UI 2.0

**0.6** -- Oct 19, 2017

* Incremental injection of extra items into type menu (via action)

**0.5** -- Oct 3, 2017

* Parent component can add extra items to type menu

**0.4** -- Sep 7, 2017

* 2 new options: `noSelect` and `auxAction`

**0.3** -- Jul 17, 2017

**0.2** -- Jun 30, 2017

**0.1** -- Jun 14, 2017

------------
Jörg Richter  
Mar 30, 2020
