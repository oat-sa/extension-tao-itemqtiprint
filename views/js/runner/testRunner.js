/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'async',
    'helpers',
    'taoQtiPrint/runner/itemRunner',
    'taoQtiPrint/lib/qrcode'
], function($, _, async, helpers, itemRunner, QRCode) {
    'use str11ict';

    //TODO find him his own place. Waiting is own house, the testRenderer squats the runner flat.
    var testRenderer = {

        createPage: function createPage(type) {
            return $('<section></section>').addClass(type);
        },

        //TODO replace by a template
        testPage: function rendertestPage(test, done) {

            var $testPage = this.createPage('title');
            var $codeElt = $('<div class="qr-code">');
            var qrCode = new QRCode($codeElt[0], {
                text:         helpers._url('render', 'PrintTest', 'taoBooklet', { uri :  test.uri}),
                width:        192,
                height:       192,
                colorDark:    "#000000",
                colorLight:   "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            $testPage.append('<h1>' + test.title + '</h1>')
                     .append($codeElt);

            done(null, $testPage);
        },

        //TODO replace by a template
        sectionPage: function renderSectionPage(section, pageNum, done) {


            var $sectionPage = this.createPage('section');

            $sectionPage.append('<h2>' + section.title + '</h2>');

            _.forEach(section.rubricBlock, function(rubricBlock) {
                $sectionPage.append('<div>' + rubricBlock + '</div>');
            });
            done(null, $sectionPage);
        },

        itemPage: function renderItemPage(item, uri, pageNum, done) {
            var $itemContainer = this.createPage('item');

            itemRunner('qtiprint', item, { uri : uri})
                .on('error', function(err) {
                    done(err);
                })
                .on('render', function() {
                    done(null, $itemContainer);
                })
                .init()
                .render($itemContainer);
        }
    };

    /**
     *
     * Builds a brand new {@link TestRunner}.
     *
     * <strong>The factory is an internal mechanism to create encapsulated contexts.
     *  I suggest you to use directly the name <i>testRunner</i> when you require this module.</strong>
     *
     *
     * @exports testRunner
     * @namespace testRunnerFactory
     *
     *
     * @returns {TestRunner}
     */
    var testRunnerFactory = function testRunnerFactory(testData, options) {

        testData = testData || {};

        if (!testData || !testData.data || !testData.items) {
            throw new Error('Invalid test data structure');
        }

        //contains the bound events.
        var events = {};

        var testRunner = {

            /**
             * Test container
             * @type {jQueryElement}
             */
            $container: null,

            /**
             * Initialize the current item.
             *
             * @param {HTMLElement|jQueryElement} elt - the DOM element that is going to contain the rendered test.
             * @returns {TestRunner} to chain calls
             *
             * @fires TestRunner#ready
             * @fires TestRunner#render
             * @fires TestRunner#error if the elt isn't valid
             *
             * @fires TestRunner#statechange the provider is reponsible to trigger this event
             * @fires TestRunner#responsechange  the provider is reponsible to trigger this event
             */
            render: function(elt) {
                var self = this;
                var pageRenderers = [];

                //check elt
                if (!(elt instanceof HTMLElement) && !(elt instanceof $)) {
                    return self.trigger('error', 'A valid HTMLElement (or a jquery element) at least is required to render the test');
                }

                //we keep a reference to the container
                if (elt instanceof $) {
                    this.$container = elt;
                } else {
                    this.$container = $(elt);
                }

                //Build the pageRenderers array that contains each page to render

                //transform the function of the renderer to fit the format required by async (partial with data and binding)
                pageRenderers.push(
                    _.bind(
                        _.partial(testRenderer.testPage, testData.data),
                        testRenderer
                    )
                );

                _.forEach(testData.data.testParts, function(testPart) {
                    _.forEach(testPart.sections, function(section) {

                        pageRenderers.push(
                            _.bind(
                                _.partial(testRenderer.sectionPage, section, pageRenderers.length),
                                testRenderer
                            )
                        );

                        _.forEach(section.items, function(item) {
                            //
                            if (testData.items[item.href] && testData.items[item.href].data) {
                                //transform the function of the renderer to fit the format required by async (partial with data and binding)
                                pageRenderers.push(
                                    _.bind(
                                        _.partial(testRenderer.itemPage, testData.items[item.href].data, item.href, pageRenderers.length),
                                        testRenderer
                                   )
                                );
                            }
                        });
                    });
                });

                //then we call all the renderers in parallel
                async.parallel(pageRenderers, function renderingDone(err, $results) {
                    if (err) {
                        self.trigger('error', 'Unable to render a page :  ' + err);
                    }

                    //once they are all done, we insert the content to the container
                    self.$container.empty().append($results);

                    /**
                     * The test is rendered
                     * @event TestRunner#render
                     */
                    self.trigger('render');

                    /**
                     * The test is ready.
                     * Alias of {@link TestRunner#render}
                     * @event TestRunner#ready
                     */
                    self.trigger('ready');
                });

                return this;
            },

            /**
             * Clear the running test.
             * @returns {TestRunner}
             *
             * @fires TestRunner#clear
             */
            clear: function() {

                this.$container.empty();

                /**
                 * The test is ready.
                 * @event TestRunner#clear
                 */
                this.trigger('clear');

                return this;
            },
            /**
             * Attach an event handler.
             * Calling `on` with the same eventName multiple times add callbacks: they
             * will all be executed.
             *
             * @param {String} name - the name of the event to listen
             * @param {Function} handler - the callback to run once the event is triggered. It's executed with the current testRunner context (ie. this
             * @returns {TestRunner}
             */
            on: function(name, handler) {
                if (_.isString(name) && _.isFunction(handler)) {
                    events[name] = events[name] || [];
                    events[name].push(handler);
                }
                return this;
            },

            /**
             * Remove handlers for an event.
             *
             * @param {String} name - the event name
             * @returns {TestRunner}
             */
            off: function(name) {
                if (_.isString(name)) {
                    events[name] = [];
                }
                return this;
            },

            /**
             * Trigger an event manually.
             *
             * @param {String} name - the name of the event to trigger
             * @param {*} data - arguments given to the handlers
             * @returns {TestRunner}
             */
            trigger: function(name, data) {
                var self = this;
                if (_.isString(name) && _.isArray(events[name])) {
                    _.forEach(events[name], function(event) {
                        event.call(self, data);
                    });
                }
                return this;
            }
        };

        return testRunner;
    };

    return testRunnerFactory;
});

