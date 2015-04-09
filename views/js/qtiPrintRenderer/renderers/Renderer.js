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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */

/**
 * The QTI Print renderer built using the print config
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'taoQtiItem/qtiRunner/core/Renderer',
    'taoQtiPrint/qtiPrintRenderer/renderers/config',
    'css!taoQtiPrintCss/qti.css'
], function(Renderer, config){
    'use strict';

    /**
     * Build and expost the printRenderer
     * @exports taoQtiPrint/qtiPrintRenderer/renderers/config
     */
    return Renderer.build(config.locations, config.name);
});