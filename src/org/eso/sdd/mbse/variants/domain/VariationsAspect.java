/*
 * 
 *    (c) European Southern Observatory, 2011
 *    Copyright by ESO 
 *    All rights reserved
 *
 *    This library is free software; you can redistribute it and/or
 *    modify it under the terms of the GNU Lesser General Public
 *    License as published by the Free Software Foundation; either
 *    version 2.1 of the License, or (at your option) any later version.
 *
 *    This library is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *    Lesser General Public License for more details.
 *
 *    You should have received a copy of the GNU Lesser General Public
 *    License along with this library; if not, write to the Free Software
 *    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307  USA
 *    
*/
package org.eso.sdd.mbse.variants.domain;

import java.util.ArrayList;
import java.util.List;

/*
 * @author Bertil Muth
 */
public class VariationsAspect extends DomainObject {
	private List<Variation> variations = new ArrayList<Variation>();
	
	public VariationsAspect() {
	}

	public List<Variation> getVariations() {
		return variations;
	}

	public void setVariations(List<Variation> variations){
		this.variations = variations;
	}
	
	@Override
	public boolean addChildElement(DomainObject element) {
		if(element instanceof Variation){
			this.variations.add((Variation)element);
			return true;
		}
		return false;
	}

	@Override
	public String toString() {
		return "<<" + getStereotypeName() + ">> " + getName();
	}
}